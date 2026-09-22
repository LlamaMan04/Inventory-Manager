import { prisma } from "../config/db.js";

export const getAllStock = async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({
      include: {
        item: true,
        location: true
      }
    });
    res.status(200).json({ 
      status: "success",
      data: stocks,
      message: "Stocks retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "An error occurred while retrieving stocks"
    });
  }
}

export const getStockById = async (req, res) => {
  const { id } = req.params;
  try {
    const stock = await prisma.stock.findUnique({
      where: { id: parseInt(id) },
      include: {
        item: true,
        location: true
      }
    });
    if (!stock) {
      return res.status(404).json({ 
        status: "error",
        message: "Stock not found"
      });
    }
    res.status(200).json({ 
      status: "success",
      data: stock,
      message: "Stock retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "An error occurred while retrieving the stock"
    });
  }
}

export const createStock = async (req, res) => {
  const { itemId, quantity, locationId } = req.body;
  try {
    const newStock = await prisma.stock.create({
      data: {
        itemId: parseInt(itemId),
        quantity: parseInt(quantity),
        locationId: parseInt(locationId)
      }
    });
    await removeEmptyStock(prisma);
    res.status(201).json({ 
      status: "success",
      data: newStock,
      message: "Stock created successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "An error occurred while creating the stock"
    });
  }
}

export const updateStock = async (req, res) => {
  const { id } = req.params;
  const { quantity, locationId } = req.body;

  try {
    const updatedStock = await prisma.stock.update({
      where: { id: parseInt(id) },
      data: {
        quantity: parseInt(quantity),
        locationId: parseInt(locationId)
      }
    });
    await removeEmptyStock(prisma);
    res.status(200).json({ 
      status: "success",
      data: updatedStock,
      message: "Stock updated successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "An error occurred while updating the stock"
    });
  }
}

export const applyStockMovements = async (req, res) => {
  const { moves } = req.body;

  try {
    await prisma.$transaction(async (transaction) => {
      for (const move of moves) {
        const itemId = parseInt(move.itemId);
        const quantity = parseInt(move.quantity);
        const from = move.from ? parseInt(move.from) : null;
        const to = move.to ? parseInt(move.to) : null;

        const source = from
          ? await transaction.stock.findUnique({ where: { itemId_locationId: { itemId, locationId: from } } })
          : null;

        if (move.type !== "receive" && (!source || source.quantity < quantity)) {
          throw new Error(`Not enough stock at the source location for item ${itemId}.`);
        }

        if (source) {
          await transaction.stock.update({
            where: { id: source.id },
            data: { quantity: source.quantity - quantity }
          });
        }

        if (move.type !== "ship") {
          const destination = await transaction.stock.findUnique({
            where: { itemId_locationId: { itemId, locationId: to } }
          });

          if (destination) {
            await transaction.stock.update({
              where: { id: destination.id },
              data: { quantity: destination.quantity + quantity }
            });
          } else {
            await transaction.stock.create({ data: { itemId, quantity, locationId: to } });
          }
        }
      }

      await removeEmptyStock(transaction);
    });

    res.status(200).json({ status: "success", message: "Stock movements applied successfully" });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message || "An error occurred while applying stock movements" });
  }
}

export const deleteStock = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.stock.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ 
      status: "success",
      message: "Stock deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "An error occurred while deleting the stock"
    });
  }
}

const removeEmptyStock = (client) => client.stock.deleteMany({
  where: { quantity: 0 }
});