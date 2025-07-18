const Voucher = require("../models/voucherModel");
const asyncHandler = require("express-async-handler");

const getVouchers = asyncHandler(async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { code: { $regex: req.query.keyword, $options: "i" } },
            { description: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    const count = await Voucher.countDocuments({ ...keyword });
    const vouchers = await Voucher.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      vouchers,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Error fetching vouchers");
  }
});

const getVoucherById = asyncHandler(async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      res.status(404);
      throw new Error("Voucher not found");
    }

    res.json(voucher);
  } catch (error) {
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid voucher ID format");
    }
    res.status(500);
    throw new Error(error.message || "Error fetching voucher");
  }
});

const createVoucher = asyncHandler(async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      startDate,
      endDate,
      description,
    } = req.body;

    if (!code || !discountType || !discountValue) {
      res.status(400);
      throw new Error("Please provide code, discount type and value");
    }

    const existingVoucher = await Voucher.findOne({ code });
    if (existingVoucher) {
      res.status(400);
      throw new Error("Voucher code already exists");
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      res.status(400);
      throw new Error("End date must be after start date");
    }

    const voucher = await Voucher.create({
      code,
      discountType,
      discountValue,
      startDate,
      endDate,
      description,
    });

    res.status(201).json(voucher);
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400);
      throw new Error("Invalid voucher data: " + error.message);
    }
    res.status(500);
    throw new Error(error.message || "Error creating voucher");
  }
});

const updateVoucher = asyncHandler(async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      startDate,
      endDate,
      description,
    } = req.body;

    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      res.status(404);
      throw new Error("Voucher not found");
    }

    if (code && code !== voucher.code) {
      const existingVoucher = await Voucher.findOne({ code });
      if (existingVoucher) {
        res.status(400);
        throw new Error("Voucher code already exists");
      }
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      res.status(400);
      throw new Error("End date must be after start date");
    }

    voucher.code = code || voucher.code;
    voucher.discountType = discountType || voucher.discountType;
    voucher.discountValue = discountValue || voucher.discountValue;
    voucher.startDate = startDate || voucher.startDate;
    voucher.endDate = endDate || voucher.endDate;
    voucher.description = description || voucher.description;

    const updatedVoucher = await voucher.save();
    res.json(updatedVoucher);
  } catch (error) {
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid voucher ID format");
    }
    if (error.name === "ValidationError") {
      res.status(400);
      throw new Error("Invalid voucher data: " + error.message);
    }
    res.status(500);
    throw new Error(error.message || "Error updating voucher");
  }
});

const deleteVoucher = asyncHandler(async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      res.status(404);
      throw new Error("Voucher not found");
    }

    await voucher.deleteOne();
    res.json({ message: "Voucher removed successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid voucher ID format");
    }
    res.status(500);
    throw new Error(error.message || "Error deleting voucher");
  }
});

module.exports = {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
};
