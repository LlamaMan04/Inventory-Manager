import { Prisma } from "@prisma/client";

export const handlePrismaError = (error, res, fallbackMessage, fallbackStatus = 500) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        // This error occurs when a unique constraint fails, meaning a record with the same value already exists.
        return res.status(409).json({
          status: "error",
          code: error.code,
          message: "A record with that value already exists.",
          field: error.meta?.target
        });
      case "P2003":
        // This error occurs when a foreign key constraint fails, meaning other records depend on the record being deleted or updated.
        return res.status(409).json({
          status: "error",
          code: error.code,
          message: "This record cannot be edited because it is still in use."
        });
      case "P2025":
        // This error occurs when a record is not found for an update or delete operation.
        return res.status(404).json({
          status: "error",
          code: error.code,
          message: "The requested record was not found."
        });
      case "P2034":
        // This error occurs when a transaction fails due to a conflict with another transaction.
        return res.status(409).json({
          status: "error",
          code: error.code,
          message: "The operation conflicted with another change. Please try again."
        });
      default:
        break;
    }
  }

  return res.status(error.statusCode || fallbackStatus).json({
    status: "error",
    message: error.statusCode ? error.message : fallbackMessage
  });
};
