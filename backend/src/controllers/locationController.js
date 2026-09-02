import { prisma } from "../config/db.js";

export const getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.status(200).json({
      status: "success",
      data: locations,
      message: "Locations retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving locations"
    });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!location) {
      return res.status(404).json({ status: "error", message: "Location not found" });
    }
    res.status(200).json({ status: "success", data: location, message: "Location retrieved successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "An error occurred while retrieving the location" });
  }
};

export const createLocation = async (req, res) => {
  const { name, description } = req.body;
  try {
    const location = await prisma.location.create({ data: { name, description } });
    res.status(201).json({ status: "success", data: location, message: "Location created successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "An error occurred while creating the location" });
  }
};

export const updateLocation = async (req, res) => {
  const { name, description } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;

  try {
    const location = await prisma.location.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.status(200).json({ status: "success", data: location, message: "Location updated successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "An error occurred while updating the location" });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: parseInt(req.params.id) } });
    res.status(200).json({ status: "success", message: "Location deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "An error occurred while deleting the location" });
  }
};