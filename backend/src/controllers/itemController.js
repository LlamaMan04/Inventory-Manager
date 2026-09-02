import { prisma } from "../config/db.js";

export const getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    res.status(200).json({
      status: "success",
      data: items,
      message: "Items retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving items"
    });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!item) {
      return res.status(404).json({ status: "error", message: "Item not found" });
    }
    res.status(200).json({ status: "success", data: item, message: "Item retrieved successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "An error occurred while retrieving the item" });
  }
};

export const createItem = async (req, res) => {
  const { name, description, barcode } = req.body;
  try {
    const item = await prisma.item.create({ data: { name, description, barcode } });
    res.status(201).json({ status: "success", data: item, message: "Item created successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "An error occurred while creating the item" });
  }
};

export const updateItem = async (req, res) => {
  const { name, description, barcode } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (barcode !== undefined) data.barcode = barcode;

  try {
    const item = await prisma.item.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.status(200).json({ status: "success", data: item, message: "Item updated successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "An error occurred while updating the item" });
  }
};

export const deleteItem = async (req, res) => {
  try {
    await prisma.item.delete({ where: { id: parseInt(req.params.id) } });
    res.status(200).json({ status: "success", message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "An error occurred while deleting the item" });
  }
};