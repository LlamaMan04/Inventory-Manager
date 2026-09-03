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
