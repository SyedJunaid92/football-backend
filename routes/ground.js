import express from "express";
import bcrypt from "bcryptjs";

const router = express.Router();

//Model
import Ground from "../models/ground.js";

// /ground/test
router.get("/test", async (req, res, next) => {
  const grounds = await Ground.find();
  res.send(grounds);
});

//GET PROFILE DETAILS
router.get("/profile/:_id", async (req, res) => {
  const _id = req.params._id;
  const ground = await Ground.findOne({ _id });
  if (!ground) {
    res.send({ message: "Not found" });
  } else {
    res.send(ground);
  }
});

router.post("/dp", async (req, res) => {
  try {
    const { _id, imgURL } = req.body;

    const ground = await Ground.findOneAndUpdate(
      { _id },
      {
        $set: {
          imgURL,
        },
      }
    );
    res.send({ message: "Updated" });
  } catch (error) {}
});
router.post("/login2", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send({ message: "Fill all the Fields" });
    }
    const ground = await Ground.findOne({ email: email });

    if (ground) {
      const isMatch = await bcrypt.compare(password, ground.password);
      if (!isMatch) {
        res.send({ message: "Password didn't match" });
      } else {
        res.send({ message: "Login Successsfully", ground });
      }
    } else {
      return res.send({
        message: "Ground not Registered, Please make an account first",
      });
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, ownername, email, password, phone, address } = req.body;

    const ground = await Ground.findOne({ email });

    if (ground) {
      res.send({ message: "Ground already Registered" });
    }
    //Creating. Enter data in database
    //teamname:teamname;
    else {
      const newGround = new Ground({
        name,
        ownername,
        email,
        password,
        phone,
        address,
      });
      await newGround.save();
      res.send({ message: "Successfully Registered, Please Login Now" });
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.post("/getSlot", async (req, res) => {
  try {
    const { _id, date } = req.body;

    const ground = await Ground.findOne({ _id });
    if (!ground) {
      res.send({ error: "Not Found" });
    }
    const slots = ground.slot;
    let flag = false;
    slots.map((item, index) => {
      if (item.date == date) {
        res.send(item.time);
        flag = true;
      }
    });
    if (flag == false) {
      res.send([]);
    }
  } catch (error) {
    res.send({ error: error });
  }
});
router.post("/bookSlot", async (req, res) => {
  try {
    const { _id, date, name, index } = req.body;
    console.log(_id, date, name, index);
    const ground = await Ground.findOne({ _id });
    const slot = ground.slot;
    let times = [];
    let flag = false;
    const data = {
      bookedby: name,
      date: date,
      in: index,
    };
    slot.map((item, index) => {
      if (item.date == date) {
        times = item.time;
        flag = true;
      }
    });
    if (flag == true) {
      // if (times[index] != null || times[index] != undefined) {
      //   return res.send({ message: "Already Booked this slot" });
      // }

      times[index] = data;

      await Ground.findOneAndUpdate(
        { _id, "slot.date": date },
        {
          $push: {
            "slot.$[date].time": {
              $each: [data],
              $position: index,
            },
          },
        },
        {
          arrayFilters: [{ "date.date": date }],
        }
      );
      res.send({ message: "Successfully Booked " });
    } else {
      times.push(data);
      let dat = { date, time: times };

      await Ground.findOneAndUpdate(
        { _id },
        {
          $push: {
            slot: dat,
          },
        }
      );
      res.send({ message: "Successfully Booked " });
    }
  } catch (error) {
    res.send({ error: error });
  }
});
router.post("/undoSlot", async (req, res) => {
  try {
    const { index, _id, date } = req.body;

    const ground = await Ground.findOne({ _id });
    const slot = ground.slot;

    await Ground.findOneAndUpdate(
      { _id },
      {
        $pull: {
          "slot.$[date].time": { in: index },
        },
      },
      {
        arrayFilters: [{ "date.date": date }],
      }
    );

    res.send({ message: "Sucessfully Removed " });
  } catch (error) {
    res.send({ error: error });
  }
});

export default router;
