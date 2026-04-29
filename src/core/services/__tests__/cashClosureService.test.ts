import { describe, expect, it } from "vitest"

import {
  CashClosure,
  CashClosurePaymentBreakdown,
  CashRegister,
  PaymentMethod,
  Sale,
  SalePayment,
  SaleItem,
} from "../../entities"
import { ValidationError } from "../../errors"
import type {
  CashClosurePaymentBreakdownRepository,
  CashClosureRepository,
  CashRegisterRepository,
  PaymentMethodRepository,
  SalePaymentRepository,
  SaleRepository,
} from "../../repositories"
import { CashClosureService } from "../CashClosureService"

function inMemoryCashRegisterRepo(seed: CashRegister[]): CashRegisterRepository {
  const byId = new Map(seed.map((row) => [row.id, row]))

  return {
    async save(cashRegister) {
      byId.set(cashRegister.id, cashRegister)
    },
    async findById(id) {
      return byId.get(id) ?? null
    },
    async list() {
      return [...byId.values()]
    },
    async findOpen() {
      const open = [...byId.values()].find((row) => row.status === "open")
      return open ?? null
    },
  }
}

function inMemorySaleRepo(seed: Sale[]): SaleRepository {
  const byId = new Map(seed.map((row) => [row.id, row]))

  return {
    async save(sale) {
      byId.set(sale.id, sale)
    },
    async findById(id) {
      return byId.get(id) ?? null
    },
    async list() {
      return [...byId.values()]
    },
    async findByDateRange(from, to) {
      const fromMs = from.getTime()
      const toMs = to.getTime()
      return [...byId.values()].filter((sale) => {
        const createdAt = new Date(sale.createdAt).getTime()
        return createdAt >= fromMs && createdAt < toMs
      })
    },
    async sumTotalByDateRange(from, to) {
      const sales = await this.findByDateRange(from, to)
      return sales.reduce((sum, sale) => sum + sale.total, 0)
    },
    async countByDateRange(from, to) {
      const sales = await this.findByDateRange(from, to)
      return sales.length
    },
  }
}

function inMemorySalePaymentRepo(seed: SalePayment[]): SalePaymentRepository {
  const byId = new Map(seed.map((row) => [row.id, row]))

  return {
    async save(payment) {
      byId.set(payment.id, payment)
    },
    async listBySaleId(saleId) {
      return [...byId.values()].filter((row) => row.saleId === saleId)
    },
  }
}

function inMemoryCashClosureRepo(): CashClosureRepository {
  const byId = new Map<string, CashClosure>()

  return {
    async save(cashClosure) {
      byId.set(cashClosure.id, cashClosure)
    },
    async findById(id) {
      return byId.get(id) ?? null
    },
    async listByBusinessDateRange(fromISO, toISO) {
      return [...byId.values()].filter((row) => {
        return row.businessDate >= fromISO && row.businessDate < toISO
      })
    },
  }
}

function inMemoryBreakdownRepo(): CashClosurePaymentBreakdownRepository {
  const byId = new Map<string, CashClosurePaymentBreakdown>()

  return {
    async save(breakdown) {
      byId.set(breakdown.id, breakdown)
    },
    async listByCashClosureId(cashClosureId) {
      return [...byId.values()].filter((row) => row.cashClosureId === cashClosureId)
    },
  }
}

function inMemoryPaymentMethodRepo(seed: PaymentMethod[]): PaymentMethodRepository {
  const byId = new Map(seed.map((row) => [row.id, row]))

  return {
    async save(method) {
      byId.set(method.id, method)
    },
    async findById(id) {
      return byId.get(id) ?? null
    },
    async list() {
      return [...byId.values()]
    },
    async listActive() {
      return [...byId.values()].filter((row) => row.isActive === 1)
    },
  }
}

describe("CashClosureService", () => {
  it("generates closure with folio and payment breakdown and closes register", async () => {
    const openRegister = CashRegister.create({
      id: "register_1",
      openingAmount: 300,
      status: "open",
      openedAt: "2026-04-12T10:00:00.000Z",
      openedByUserId: "user_cashier_001",
    })

    const sale1 = Sale.create({
      id: "sale_1",
      userId: "user_cashier_001",
      cashRegisterId: openRegister.id,
      createdAt: "2026-04-12T11:00:00.000Z",
      items: [
        SaleItem.create({
          id: "item_1",
          saleId: "sale_1",
          productId: "prod_1",
          quantity: 2,
          price: 50,
        }).toJSON(),
      ],
    })

    const sale2 = Sale.create({
      id: "sale_2",
      userId: "user_cashier_001",
      cashRegisterId: openRegister.id,
      createdAt: "2026-04-12T12:00:00.000Z",
      items: [
        SaleItem.create({
          id: "item_2",
          saleId: "sale_2",
          productId: "prod_2",
          quantity: 1,
          price: 70,
        }).toJSON(),
      ],
    })

    const payments = [
      SalePayment.create({
        id: "pay_1",
        saleId: sale1.id,
        paymentMethodId: "cash",
        amount: 100,
        tendered: 120,
        changeDue: 20,
      }),
      SalePayment.create({
        id: "pay_2",
        saleId: sale2.id,
        paymentMethodId: "card",
        amount: 70,
      }),
    ]

    const registerRepo = inMemoryCashRegisterRepo([openRegister])
    const paymentMethodRepo = inMemoryPaymentMethodRepo([
      PaymentMethod.create({ id: "cash", method: "Efectivo", isCash: 1, isActive: 1 }),
      PaymentMethod.create({ id: "card", method: "Tarjeta", isCash: 0, isActive: 1 }),
    ])

    const service = new CashClosureService(
      inMemorySaleRepo([sale1, sale2]),
      inMemorySalePaymentRepo(payments),
      inMemoryCashClosureRepo(),
      inMemoryBreakdownRepo(),
      registerRepo,
      paymentMethodRepo,
    )

    const result = await service.closeDaily({
      businessDate: "2026-04-12",
      closedAt: "2026-04-12T19:00:00.000Z",
      userId: "user_cashier_001",
      notes: "Cierre completo",
      isFinal: true,
    })

    expect(result.closure.folio.startsWith("CC-20260412-")).toBe(true)
    expect(result.closure.salesCount).toBe(2)
    expect(result.closure.totalAmount).toBeCloseTo(170)

    const byMethod = new Map(result.breakdown.map((row) => [row.paymentMethodId, row.totalAmount]))
    expect(byMethod.get("cash")).toBeCloseTo(100)
    expect(byMethod.get("card")).toBeCloseTo(70)

    expect(result.summary.hasSales).toBe(true)
    expect(result.summary.totalSalesAmount).toBeCloseTo(170)
    expect(result.summary.grossCashAmount).toBeCloseTo(120)
    expect(result.summary.changeReturned).toBeCloseTo(20)
    expect(result.summary.totalInDrawer).toBeCloseTo(400)
    expect(result.summary.paymentSummary[0]?.paymentMethodName).toBe("Efectivo")

    const closed = await registerRepo.findById(openRegister.id)
    expect(closed?.status).toBe("closed")
  })

  it("fails when there is no open register", async () => {
    const service = new CashClosureService(
      inMemorySaleRepo([]),
      inMemorySalePaymentRepo([]),
      inMemoryCashClosureRepo(),
      inMemoryBreakdownRepo(),
      inMemoryCashRegisterRepo([]),
      inMemoryPaymentMethodRepo([]),
    )

    await expect(service.closeDaily()).rejects.toBeInstanceOf(ValidationError)
  })

  it("uses openedByUserId when close input omits userId", async () => {
    const openRegister = CashRegister.create({
      id: "register_2",
      openingAmount: 100,
      status: "open",
      openedAt: "2026-04-13T08:00:00.000Z",
      openedByUserId: "user_cashier_002",
    })

    const service = new CashClosureService(
      inMemorySaleRepo([]),
      inMemorySalePaymentRepo([]),
      inMemoryCashClosureRepo(),
      inMemoryBreakdownRepo(),
      inMemoryCashRegisterRepo([openRegister]),
      inMemoryPaymentMethodRepo([]),
    )

    const result = await service.closeDaily({
      businessDate: "2026-04-13",
      closedAt: "2026-04-13T12:00:00.000Z",
      isFinal: true,
    })

    expect(result.closure.userId).toBe("user_cashier_002")
    expect(result.summary.hasSales).toBe(false)
    expect(result.summary.noSalesMessage).toBe("No se registraron ventas en este corte.")
    expect(result.summary.totalInDrawer).toBeCloseTo(100)
  })
})
