const admin = require("firebase-admin");
const months = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic"
];

createUser = (req, res) => {
  admin
    .auth()
    .createUser({
      email: req.body.email,
      password: req.body.password,
      displayName: req.body.name,
      disabled: false
    })
    .then(function(userRecord) {
      res.status(200).send({ created: true, userId: userRecord.uid });
    })
    .catch(function(error) {
      res.send({ created: false, error: error.code });
    });
};

updateUser = (req, res) => {
  const data = req.body;
  admin
    .auth()
    .getUserByEmail(data.email)
    .then(resp => {
      const user = resp;
      const db = admin.database();
      const ref = db.ref(`prod/users/${user.uid}`);
      ref.once(
        "value",
        snapshot => {
          if (snapshot.val().generatedPassword == data.randomPassword) {
            admin
              .auth()
              .updateUser(user.uid, {
                password: data.password
              })
              .then(resp => {
                res.status(200).send({ updated: true, data: user });
              })
              .catch(error => {
                res.send({ updated: false, error: error });
              });
          } else {
            res.send({
              updated: false,
              equal: false,
              error: "No coincide la clave temporal"
            });
          }
        },
        error => {
          if (error) {
            res.send({ updated: false, error: error });
          }
        }
      );
    })
    .catch(error => {
      res.send({ getUser: false, error: error });
    });
};

deleteUser = (req, res) => {
  console.log(req.body.userId);
  admin
    .auth()
    .deleteUser(req.body.userId)
    .then(resp => {
      console.log("Successfully deleted user");
      res.status(200).send({ deleted: true });
    })
    .catch(function(error) {
      console.log("Error deleting user:", error);
      res.send({ deleted: false, error: error });
    });
};

getLast5Days = currentDate => {
  return [1, 2, 3, 4, 5].map((elem, index) => {
    const newDate =
      index > 0
        ? new Date(currentDate.setDate(currentDate.getDate() - 1))
        : new Date(currentDate.setDate(currentDate.getDate()));
    return `${("00" + newDate.getDate()).slice(-2)}-${
      months[newDate.getMonth()]
    }-${("" + newDate.getFullYear()).slice(-4)}`;
  });
};

getLast5ProductsByDay = async (req, res) => {
  try {
    const db = admin.database();
    const ref = db.ref(`prod/ordersGroupedByPlaces/${req.body.idPlace}`);
    const newDate = new Date();
    const element = `${("00" + newDate.getDate()).slice(-2)}-${
      months[newDate.getMonth()]
    }-${("" + newDate.getFullYear()).slice(-4)}`;
    const array = [];
    
    let orders = await getProducts(req, res, ref, element, array);
    let filteredOrders = await getFilteredOrders(element, orders).then(val => val).catch(error => error);
    let demandProducts = {};
    if (filteredOrders.length > 0) {
      demandProducts = await getDemandProducts(db, filteredOrders);
      res.status(200).send({ data: demandProducts });
    }
    else {
      res.status(200).send({ data: {} });
    }
  } catch(error) {
    res.send({ data: {}, error: error });
  }
};

getProducts = async (req, res, ref, element, array) => {
  try {
    let orders = await ref.once("value").then(data => {
      return data;
    });
    return orders;
  }
  catch (error) {
    res.send({ data: {}, error: error })
  }
};

getFilteredOrders = (element, orders) => {
  return new Promise((resolve, reject) => {
    let myOrders = orders.val();
    let sizeOrders = orders.numChildren();
    let count = 0;
    const array = [];
    for (let [key, elem] of Object.entries(myOrders)) {
      // Iterate OrdersGroupedByPlaces
      count++;
      if (elem.timestamp !== undefined) {
        const myDate =
          elem.timestamp.split(" ")[0] +
          " " +
          elem.timestamp.split(" ")[1];
        const date = new Date(myDate);
        const arr = element.split("-");
        const index = months.findIndex(function(el) {
          return el === arr[1];
        });
        if (
          date.getDate() === parseInt(arr[0]) &&
          date.getMonth() === index &&
          date.getFullYear() === parseInt(arr[2])
        ) {
          array.push(key);
        }
      }
      if (count === sizeOrders) {
        if (array.length === 0) {
          reject(-1);
        }
        resolve(array);
      }
    }
   });
};

getFilteredOrdersByMonth = (element, orders) => {
  return new Promise((resolve, reject) => {
    let myOrders = orders.val();
    let sizeOrders = orders.numChildren();
    let count = 0;
    const array = [];
    for (let [key, elem] of Object.entries(myOrders)) {
      
      // Iterate OrdersGroupedByPlaces
      count++;
      if (elem.timestamp !== undefined) {
        const date = new Date(elem.timestamp.split(" ")[0]);
        const arr = element.split("-");

        if (
          date.getMonth() == arr[0] &&
          date.getFullYear() == parseInt(arr[1])
        ) {
          array.push(key);
        }
      }
      if (count === sizeOrders) {
        if (array.length === 0) {
          reject(-1);
        }
        resolve(array);
      }
    }
   });
};

getFilteredOrdersByYear = (element, orders) => {
  return new Promise((resolve, reject) => {
    let myOrders = orders.val();
    let sizeOrders = orders.numChildren();
    let count = 0;
    const array = [];
    for (let [key, elem] of Object.entries(myOrders)) {
      // Iterate OrdersGroupedByPlaces
      count++;
      if (elem.timestamp !== undefined) {
        const date = new Date(elem.timestamp.split(" ")[0]);
        const arr = element.split("-");
        if (date.getFullYear() === parseInt(arr[0])) {
          array.push(key);
        }
      }
      
      if (count === sizeOrders) {
        if (array.length === 0) {
          reject(-1);
        }
        resolve(array);
      }
    }
   });
}

getDemandProducts = async (db, array) => {
  try {
    const jsonMostWanted = {};
    for( let index = 0; index < array.length; index++) {
      let cont = 0;
      let orderProducts = await db.ref(`prod/orderProducts/${array[index]}`).once("value").then( dat => {
        return dat.val();
      });
      for ( let [key, elem] of Object.entries(orderProducts) ) {
        let product = await db.ref(`prod/orderProducts/${array[index]}/${key}`).once("value").then( data => {
          return data.val();
        });
        if (jsonMostWanted[`${key}`]) {
          jsonMostWanted[`${key}`].name = product.name;
        } else {
          jsonMostWanted[`${key}`] = {};
          jsonMostWanted[`${key}`]["name"] = product.name;
        }
        if (jsonMostWanted[`${key}`].times) {
          jsonMostWanted[`${key}`].times += product.quantity;
        } else {
          jsonMostWanted[`${key}`]["times"] = product.quantity;
        }
      }
      if (index === array.length - 1) {
        console.log(jsonMostWanted);
        return (jsonMostWanted);
      }
    }
  }
  catch (error) {
    console.log(error);
  }
}

getProductsByMonth = async (req, res) => {
  try {
    const db = admin.database();
    const ref = db.ref(`prod/ordersGroupedByPlaces/${req.body.idPlace}`);
    const newDate = new Date();
    const element = `${newDate.getMonth()}-${(
      "0000" + newDate.getFullYear()
    ).slice(-4)}`;
    const array = [];
    let orders = await getProducts(req, res, ref, element, array);
    let filteredOrders = await getFilteredOrdersByMonth(element, orders).then(val => val).catch(error => error);
    let demandProducts = {};
      if (filteredOrders.length > 0) {
        demandProducts = await getDemandProducts(db, filteredOrders);
        res.status(200).send({ data: demandProducts });
      }
      else {
        res.status(200).send({ data: {} });
      }
  }
  catch (error) {
    res.send({ data: {}, error: error });
  }
}

getProductsByYear = async (req, res) => {
  try {
    const db = admin.database();
    const ref = db.ref(`prod/ordersGroupedByPlaces/${req.body.idPlace}`);
    const newDate = new Date();
    const element = `${("0000" + newDate.getFullYear()).slice(-4)}`;
    const array = [];
    let orders = await getProducts(req, res, ref, element, array);
    let filteredOrders = await getFilteredOrdersByYear(element, orders).then(val => val).catch(error => error);
    let demandProducts = {};
    console.log(filteredOrders);
    if (filteredOrders.length > 0) {
      demandProducts = await getDemandProducts(db, filteredOrders);
      res.status(200).send({ data: demandProducts });
    }
    else {
      res.status(200).send({ data: {} });
    }
  }
  catch(error) {
    res.send({ data: {}, error: error });
  }
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getLast5ProductsByDay,
  getProductsByMonth,
  getProductsByYear
};
