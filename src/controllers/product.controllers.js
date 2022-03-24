const express = require("express");

const client = require("../configs/redis");

const Product = require("../models/product.models");

const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    const products = await Product.find().lean().exec();

    client.set("redis_key", JSON.stringify(products));

    return res.status(200).send(product);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message, status: "Failed to create" });
  }
});
// pagination
router.get("/:page/:size", async (req, res) => {
  try {
    const page = +req.params.page || 1;

    const size = +req.params.size || 5;

    const skip = (page - 1) * size;

    let totalPage = Math.ceil((await Product.find().countDocuments()) / size);

    const product = await Product.find().skip(skip).limit(size).lean().exec();

    return res.status(200).json({ product, totalPage });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message, status: "Failed to create" });
  }
});

router.get("/", (req, res) => {
  try {
    client.get("redis_key", async function (err, fetchedprod) {
      if (fetchedprod) {
        const product = JSON.parse(fetchedprod);

        return res.status(200).send({ product, redis: true });
      } else {
        try {
          const product = await Product.findById(req.params.id).lean().exec();

          client.setex("redis_key", 100, JSON.stringify(product));

          return res.status(200).send({ product, redis: false });
        } catch (err) {
          return res.status(500).send({ message: err.message });
        }
      }
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    client.get(`redis_key.${req.params.id}`, async function (err, fetchedprod) {
      if (fetchedprod) {
        const product = JSON.parse(fetchedprod);

        return res.status(200).send({ product, redis: true });
      } else {
        try {
          const product = await Product.findById(req.params.id).lean().exec();

          client.set(`redis_key.${req.params.id}`, JSON.stringify(product));

          return res.status(200).send({ product, redis: false });
        } catch (err) {
          return res.status(500).send({ message: err.message });
        }
      }
    });
  } catch (err) {
    return res
      .status(500)
      .send({ message: err.message, status: "Failed to create" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    client.setex(`redis_key.${req.params.id}`, 360, JSON.stringify(product));

    const products = await Product.find().lean().exec();

    client.setex("redis_key", 300, JSON.stringify(products));

    return res.status(200).json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    client.del(`redis_key.${req.params.id}`);

    const products = await Product.find().lean().exec();

    client.setex("redis_key", 400, JSON.stringify(products));

    return res.status(200).json(product);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message, status: "Failed to create" });
  }
});

module.exports = router;
