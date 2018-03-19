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
      const ref = db.ref(`users/${user.uid}`);
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

getLast5ProductsByDay = (req, res) => {
  const db = admin.database();
  const ref = db.ref(`ordersGroupedByPlaces/${req.body.idPlace}`);
  const jsonMostWanted = {};
  let count = 0;
  const newDate = new Date();
  const element = `${("00" + newDate.getDate()).slice(-2)}-${
    months[newDate.getMonth()]
  }-${("" + newDate.getFullYear()).slice(-4)}`;
  const array = [];
  ref.on("value", data => {
    return new Promise((resolve, reject) => {
      data.forEach(elem => {
        // Iterate OrdersGroupedByPlaces
        count++;
        const date = new Date(elem.val().timestamp);
        const arr = element.split("-");
        const index = months.findIndex(function(el) {
          return el === arr[1];
        });
        if (
          date.getDate() === parseInt(arr[0]) &&
          date.getMonth() === index &&
          date.getFullYear() === parseInt(arr[2])
        ) {
          let key1 = elem.key;
          array.push(key1);
        }
        if (count === data.numChildren()) {
          if (array.length === 0) {
            reject();
          }
          resolve(array);
        }
      });
    })
      .then(array => {
        return new Promise((resolve, rejected) => {
          array.forEach((k, index) => {
            let cont = 0;
            db.ref(`orderProducts/${k}`).on("value", async dat => {
              // Get OrdersProducts by key1
              const getData = async () => {
                await dat.forEach(elem2 => {
                  // Iterate details OrdersProducts
                  cont++;
                  let key2 = elem2.key;
                  db.ref(`orderProducts/${k}/${key2}`).on("value", val => {
                    // Get details odersProducts by key1, key2
                    if (jsonMostWanted[`${val.key}`]) {
                      jsonMostWanted[`${val.key}`].name = val.val().name;
                    } else {
                      jsonMostWanted[`${val.key}`] = {};
                      jsonMostWanted[`${val.key}`]["name"] = val.val().name;
                    }
                    if (jsonMostWanted[`${val.key}`].times) {
                      jsonMostWanted[`${val.key}`].times += val.val().quantity;
                    } else {
                      jsonMostWanted[`${val.key}`][
                        "times"
                      ] = val.val().quantity;
                    }
                  });
                });
              };
              await getData();
              if (index === array.length - 1) {
                resolve(jsonMostWanted);
              }
            });
          });
        });
      })
      .then(json => res.status(200).send({ data: json }))
      .catch(error => res.send({ data: {}, error: error }));
  });
};

getProductsByMonth = (req, res) => {
  const db = admin.database();
  const ref = db.ref(`ordersGroupedByPlaces/${req.body.idPlace}`);
  const jsonMostWanted = {};
  let count = 0;
  const newDate = new Date();
  const element = `${months[newDate.getMonth()]}-${(
    "0000" + newDate.getFullYear()
  ).slice(-4)}`;
  const array = [];
  ref.on("value", data => {
    return new Promise((resolve, reject) => {
      data.forEach(elem => {
        // Iterate OrdersGroupedByPlaces
        count++;
        const date = new Date(elem.val().timestamp);
        const arr = element.split("-");
        const index = months.findIndex(function(el) {
          return el === arr[0];
        });
        if (
          date.getMonth() === index &&
          date.getFullYear() === parseInt(arr[1])
        ) {
          let key1 = elem.key;
          array.push(key1);
        }
        if (count === data.numChildren()) {
          if (array.length === 0) {
            reject();
          }
          resolve(array);
        }
      });
    })
      .then(array => {
        return new Promise((resolve, rejected) => {
          array.forEach((k, index) => {
            let cont = 0;
            db.ref(`orderProducts/${k}`).on("value", async dat => {
              // Get OrdersProducts by key1
              const getData = async () => {
                await dat.forEach(elem2 => {
                  // Iterate details OrdersProducts
                  cont++;
                  let key2 = elem2.key;
                  db.ref(`orderProducts/${k}/${key2}`).on("value", val => {
                    // Get details odersProducts by key1, key2
                    if (jsonMostWanted[`${val.key}`]) {
                      jsonMostWanted[`${val.key}`].name = val.val().name;
                    } else {
                      jsonMostWanted[`${val.key}`] = {};
                      jsonMostWanted[`${val.key}`]["name"] = val.val().name;
                    }
                    if (jsonMostWanted[`${val.key}`].times) {
                      jsonMostWanted[`${val.key}`].times += val.val().quantity;
                    } else {
                      jsonMostWanted[`${val.key}`][
                        "times"
                      ] = val.val().quantity;
                    }
                  });
                });
              };
              await getData();
              if (index === array.length - 1) {
                resolve(jsonMostWanted);
              }
            });
          });
        });
      })
      .then(json => res.status(200).send({ data: json }))
      .catch(error => res.send({ data: {}, error: error }));
  });
};

getProductsByYear = (req, res) => {
  const db = admin.database();
  const ref = db.ref(`ordersGroupedByPlaces/${req.body.idPlace}`);
  const jsonMostWanted = {};
  let count = 0;
  const newDate = new Date();
  const element = `${("0000" + newDate.getFullYear()).slice(-4)}`;
  const array = [];
  ref.on("value", data => {
    return new Promise((resolve, reject) => {
      data.forEach(elem => {
        // Iterate OrdersGroupedByPlaces
        count++;
        const date = new Date(elem.val().timestamp);
        const arr = element.split("-");
        if (date.getFullYear() === parseInt(arr[0])) {
          let key1 = elem.key;
          array.push(key1);
        }
        if (count === data.numChildren()) {
          if (array.length === 0) {
            reject();
          }
          resolve(array);
        }
      });
    })
      .then(array => {
        return new Promise((resolve, rejected) => {
          array.forEach((k, index) => {
            let cont = 0;
            db.ref(`orderProducts/${k}`).on("value", async dat => {
              // Get OrdersProducts by key1
              const getData = async () => {
                await dat.forEach(elem2 => {
                  // Iterate details OrdersProducts
                  cont++;
                  let key2 = elem2.key;
                  db.ref(`orderProducts/${k}/${key2}`).on("value", val => {
                    // Get details odersProducts by key1, key2
                    if (jsonMostWanted[`${val.key}`]) {
                      jsonMostWanted[`${val.key}`].name = val.val().name;
                    } else {
                      jsonMostWanted[`${val.key}`] = {};
                      jsonMostWanted[`${val.key}`]["name"] = val.val().name;
                    }
                    if (jsonMostWanted[`${val.key}`].times) {
                      jsonMostWanted[`${val.key}`].times += val.val().quantity;
                    } else {
                      jsonMostWanted[`${val.key}`][
                        "times"
                      ] = val.val().quantity;
                    }
                  });
                });
              };
              await getData();
              if (index === array.length - 1) {
                resolve(jsonMostWanted);
              }
            });
          });
        });
      })
      .then(json => res.status(200).send({ data: json }))
      .catch(error => res.send({ data: {}, error: error }));
  });
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getLast5ProductsByDay,
  getProductsByMonth,
  getProductsByYear
};
