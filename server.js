require("dotenv").config();

var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
const flash = require('express-flash');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var bcrypt = require('bcrypt');
const passport = require("passport");
const cors = require("cors");

const {
  getAllDataFromTarget,
  getOrdersById,
  getClientById,
  getOrdersByClientId,
  getServicesBySingleOrderId,
  getServicesByMultipleOrderId,
  deleteServicesById,
  addMultipleServices,
  updateOrderById,
  updateClientById,
  getAllClientsWithOrdersCount,
  addNewClient,
  getDasboardData,
  addNewEvent,
  addNewOrder,
  deleteUserById,
  getUsersForAdminPanel,
  createNewUser
} = require("./queries.js");

var connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true,
  timezone: 'utc'
});
// CONFIGURING OPTIONS
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200
};

const initializePassport = require('./passport-config');
initializePassport(connection, passport);

app.use(cors(corsOptions));
app.use(flash());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
// END OF CONFIGURING OPTIONS

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send("success")
});

app.get('/logout', (req, res) => {
  req.logout();
  res.send("success");
});

app.get('/user', (req, res) => {
  res.send(req.user)
});

// ALL ORDERS SECTION *
app.get("/orders", async (req, res) => {
  const queryAllOrders = await getAllDataFromTarget("orders");
  const queryAllClients = await getAllDataFromTarget("clients");
  const mergedQueries = queryAllOrders.map(order => ({
    ...order,
    ...queryAllClients.find(client => client.client_id === order.client_id)
  }));
  res.send(mergedQueries)
});
// END OF ALL ORDERS SECTION *

// ORDER BY ID SECTION *
app.get("/order_by_id", async (req, res) => {
  const orderId = req.query.id;
  const queryOrderById = await getOrdersById(orderId);
  const queryServicesByOrderID = await getServicesBySingleOrderId(orderId);
  const queryClientById = await getClientById(queryOrderById.client_id);

  Promise.all([queryOrderById, queryServicesByOrderID, queryClientById]).then((results) => {
    res.send(results)
  })
});
// END OF ORDER BY ID SECTION *

// CREATE NEW ORDER * 
app.post("/neworder", async (req, res) => {
  let newOrderData = req.body.clientDetails;
  // if new client was selected
  let isNewClient = req.body.isNewClient;
  // if existing client was selected
  let oldClientId = req.body.oldClientId;
  let dataDetails = newOrderData;
  let servicesData = newOrderData.services;
  let totalCostOfServices = servicesData.reduce(
    (accumulator, service) =>
      accumulator + (service.itemPrice * service.amount || 0),
    0
  );
  let currentDate = new Date();

  // if new client is being created
  if(isNewClient) {
    const queryAddNewClient = await addNewClient(dataDetails);
    const queryAddNewOrder = await addNewOrder(dataDetails, queryAddNewClient, totalCostOfServices, currentDate);
    const queryAddMultipleServices = await addMultipleServices(queryAddNewOrder, servicesData);
    Promise.all([queryAddNewClient, queryAddNewOrder, queryAddMultipleServices]).then(() => {
      res.send("success");
    })
  } else {
    const queryAddNewOrder = await addNewOrder(dataDetails, oldClientId, totalCostOfServices, currentDate);
    const queryAddMultipleServices = await addMultipleServices(queryAddNewOrder, servicesData);
    Promise.all([queryAddNewOrder, queryAddMultipleServices]).then(() => {
      res.send("success");
    })
  }
})
// END OF CREATING NEW ORDER *

// UPDATING ORDER SECTION *
app.post("/updateorder", async (req, res) => {
  let orderId = req.body.orderId;
  let clientData = req.body.clientDetails.client;
  let orderData = req.body.clientDetails.order;
  let servicesData = req.body.clientDetails.services;
  let deletedIds = req.body.deletedItems.ids;
  let totalCostOfServices = servicesData.reduce(
    (accumulator, service) =>
      accumulator + (service.itemPrice * service.amount || 0),
    0
  );
  let currentDate = new Date();

  const queryUpdateClientById = await updateClientById(clientData, orderData.client_id);
  const queryUpdateOrderById = await updateOrderById(totalCostOfServices, orderData.status, orderId);
  const queryAddMultipleServices = await addMultipleServices(orderId, servicesData);

  // if user is deleteing some Services from order
  if(deletedIds.length > 0) {
    const queryDeleteServicesById = await deleteServicesById(deletedIds);
    Promise.all([queryUpdateClientById, queryUpdateOrderById, queryAddMultipleServices, queryDeleteServicesById]).then(() => {
      res.send("success");
    });
  } else {
    Promise.all([queryUpdateClientById, queryUpdateOrderById, queryAddMultipleServices]).then(() => {
      res.send("success");
    });
  }
})
// END OF UPDATING ORDER SECTION *


// ALL CLIENTS SECTION *
app.get("/clients", async (req, res) => {
  const queryAllClientsWithOrdersCount = await getAllClientsWithOrdersCount();
  Promise.resolve(queryAllClientsWithOrdersCount).then((results) => {
    res.send(results);
  })
})
// END OF ALL CLIENTS SECTION *

// ADD NEW CLIENT SECTION *
app.post("/newclient", async (req, res) => {
  const clientDetails = req.body.clientDetails;
  const queryAddingNewClient = await addNewClient(clientDetails);
  Promise.resolve(queryAddingNewClient).then(() => {
    res.send("success");
  })
})
// END OF ADDING NEW CLIENT SECTION *

// CLIENT BY ID SECTION *
app.get("/client_by_id", async (req, res) => {
  const clientId = req.query.id;

  const queryClientById = await getClientById(clientId);
  const queryOrdersByClientId = await getOrdersByClientId(clientId);
  const queryServicesByOrderId = await getServicesByMultipleOrderId(queryOrdersByClientId);

  Promise.all([queryClientById, queryOrdersByClientId, queryServicesByOrderId]).then((results) => {
    res.send(results);
  });
});
// END OF CLIENT BY ID SECTION *

// DASHBOARD DATA SECTION *
app.get("/dashboard_data", async (req,res) => {
  const queryDashboardData = await getDasboardData();
  Promise.resolve(queryDashboardData).then((results) => {
    res.send(results);
  })
})
// END OF DASHBOARD DATA SECTION *

// ADD NEW EVENT SECTION *
app.post("/newevent", async (req, res) => {
  const eventData = req.body.eventData;
  const queryAddNewEvent = await addNewEvent(eventData);
  Promise.resolve(queryAddNewEvent).then(() => {
    res.send("success");
  })
})
// END OF NEW EVENT SECTION *

// GET ALL EVENTS *
app.get("/events", async (req, res) => {
  const queryAllEvents = await getAllDataFromTarget("calendar");
  Promise.resolve(queryAllEvents).then((results) => {
    res.send(results);
  })
})
// END OF ALL EVENTS *

// GET USERS FOR ADMIN PANEL SECTION *
app.get("/getusers", async (req, res) => {
  const queryGetUsersForAdminPanel = await getUsersForAdminPanel();
  Promise.resolve(queryGetUsersForAdminPanel).then((results) => {
    res.send(results);
  })
})
// END OF GET USERS FOR ADMIN PANEL SECTION *

// DELETE USER BY ID SECTION *
app.post("/deleteuser", async (req, res) => {
  let userId = req.body.userId;
  const queryDeleteUser = await deleteUserById(userId);
  Promise.resolve(queryDeleteUser).then(() => {
    res.send("success");
  })
});
// DELETE USER BY ID SECTION *

// CREATE NEW USER SECTION *
app.post("/newuser", async (req, res) => {
  const userDetails = req.body.userDetails;
  const hashedPassword = await bcrypt.hash(userDetails.password, 10);
  const queryCreateNewUser = await createNewUser(userDetails, hashedPassword);
  Promise.resolve(queryCreateNewUser).then(() => {
    res.send("success");
  })
})
// END OF CREATE NEW USER SECTION *

const port = 5000;
app.listen(port, () => `Server running on port ${port}`);
