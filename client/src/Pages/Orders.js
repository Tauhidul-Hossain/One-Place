import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Styles/order.css";
import { AuthLoginInfo } from "./../AuthComponents/AuthLogin";
import Popup from "../Components/Popup";
import SearchBar from "../Components/SearchBar";
import Pagination from "../Components/Pagination";
import ReadMoreRoundedIcon from "@mui/icons-material/ReadMoreRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

function Orders() {
  const [newOrderSubmitted, setNewOrderSubmitted] = useState(false);

  const [ordersData, setOrdersData] = useState([]);
   const [filteredData, setFilteredData] = useState([]);

  const [buttonPopup, setButtonPopup] = useState(false);

  const [filterOrders, setFilterOrders] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterActive, setFilterActive] = useState(1);

  const [isNewClient, setIsNewClient] = useState(true);
  const [displaySearch, setDisplaySearch] = useState(false);
  const [oldClientId, setOldClientId] = useState(null);
  const [stringSearch, setStringSearch] = useState("");
  const [allClientsData, setAllClientsData] = useState([]);

  const ctx = useContext(AuthLoginInfo);

  console.log(ordersData)

  const [clientDetails, setClientDetails] = useState({
    clientName: "",
    clientDetails: "",
    Mobile: "",
    companyName: "",
    street: "",
    city: "",
    postalCode: "",
    status: "",
    services: [],
    workerName: ctx.username,
  });
  const [serviceDetails, setServiceDetails] = useState({
    serviceName: "",
    amount: 1,
    itemPrice: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    setNewOrderSubmitted(false);
    axios
      .get("http://localhost:5000/orders", { withCredentials: true })
      .then((res) => {
        if (res.data != null) {
          setOrdersData(res.data);
          setFilteredData(res.data);
        }
      });
  }, [newOrderSubmitted]);

  const handleSearchChange = (newFilteredData) => {
    setFilteredData(newFilteredData);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const totalOrders = filteredData.length;
  const computedOrders = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  );

  const removeService = (e) => {
    let array = clientDetails.services;
    console.log(array);
    let index = clientDetails.services.e;
    if (index !== -1) {
      array.splice(index, 1);
      setClientDetails({
        ...clientDetails,
        services: array,
      });
    }
  };

  const addNewOrder = () => {
    axios
      .post(
        "http://localhost:5000/neworder",
        {
          clientDetails,
          isNewClient,
          oldClientId,
        },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data === "success") {
          setClientDetails({
            clientName: "",
            clientDetails: "",
            mobile: "",
            companyName: "",
            street: "",
            city: "",
            postalCode: "",
            status: "",
            services: [],
            workerName: ctx.username,
          });
          setServiceDetails({
            serviceName: "",
            amount: 1,
            itemPrice: 0,
            totalPrice: 0,
          });
          setNewOrderSubmitted(true);
        }
      });
  };

  const getAllClientsFromDatabase = () => {
    axios
      .get("http://localhost:5000/clients", { withCredentials: true })
      .then((res) => {
        setAllClientsData(res.data[0]);
      });
  };

  const setSearchingInput = (
    id,
    client,
    details,
    mobile,
    companyName,
    street,
    city,
    postalCode
  ) => {
    setOldClientId(id);
    setClientDetails({
      ...clientDetails,
      clientName: client,
      clientDetails: details,
      mobile: mobile,
      companyName: companyName,
      street: street,
      city: city,
      postalCode: postalCode,
    });
    setDisplaySearch(false);
    setStringSearch("");
  };

  return (
    <div className="bodyWrap">
      <div className="contentOrderWrap">
        <div className="leftSide">
          <h1>Orders</h1>
          <Pagination
            total={totalOrders}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
          <div className="orderNavWrap">
            <div className="orderNav">
              <ul>
                <li
                  className={`${filterActive === 1 ? "active" : ""}`}
                  onClick={() => {
                    setFilterOrders("");
                    setFilterActive(1);
                  }}
                >
                  All orders
                </li>
                <li
                  className={`${filterActive === 2 ? "active" : ""}`}
                  onClick={() => {
                    setFilterOrders("Visit");
                    setFilterActive(2);
                  }}
                >
                  Visit
                </li>
                <li
                  className={`${filterActive === 3 ? "active" : ""}`}
                  onClick={() => {
                    setFilterOrders("Open");
                    setFilterActive(3);
                  }}
                >
                  Open
                </li>
                <li
                  className={`${filterActive === 4 ? "active" : ""}`}
                  onClick={() => {
                    setFilterOrders("Completed");
                    setFilterActive(4);
                  }}
                >
                  Completed
                </li>
                <li
                  className={`${filterActive === 4 ? "active" : ""}`}
                  onClick={() => {
                    setFilterOrders("Canceld");
                    setFilterActive(4);
                  }}
                >
                  Canceld
                </li>
              </ul>
            </div>
            <div className="addOrderWrap">
              <SearchBar
                data={ordersData}
                handleSearchChange={handleSearchChange}
                dataType="orders"
                status={filterOrders}
              />
              <button
                className="addOrder"
                onClick={() => {
                  setButtonPopup(true);
                  setIsNewClient(true);
                  getAllClientsFromDatabase();
                }}
              >
                <AddCircleOutlineRoundedIcon />
                <span className="addOrderText">Add</span>
              </button>
            </div>
          </div>
          <div className="orderWrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {computedOrders?.map((order) => {
                  return (
                    <tr key={order.id}>
                      <td>
                        <font className="maincolor">#</font>
                        {order.id}
                      </td>
                      <td>{order.client}</td>
                      <td>{order.date.split("T")[0]}</td>
                      <td className={order.status}>{order.status}</td>
                      <td>
                        {order.price}
                        TK
                      </td>
                      <td className="maincolor">
                        <Link to={`/orders/${order.id}`}>
                          <ReadMoreRoundedIcon />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
        <div className="popupWrap">
          <div className="serviceSummary">
            <h3 className="serviceSummaryLeft">Add new order</h3>
            <div className="serviceSummaryRight newUserSwitch">
              <h3>New client?</h3>
              <input
                type="radio"
                name="rdo"
                id="yes"
                onChange={() => setIsNewClient(true)}
                defaultChecked="defaultChecked"
              />
              <input
                type="radio"
                name="rdo"
                id="no"
                onChange={() => setIsNewClient(false)}
              />
              <div className="switch">
                <label className="switchLabel" htmlFor="yes">
                  Yes
                </label>
                <label className="switchLabel" htmlFor="no">
                  No
                </label>
                <span></span>
              </div>
            </div>
          </div>
          <div className="addNewOrderWrap">
            {!isNewClient && (
              <div className="autoCompleteWrap">
                <input
                  id="autoCompleteInput"
                  placeholder="Search client..."
                  type="text"
                  autoComplete="off"
                  value={stringSearch}
                  onChange={(e) => {
                    setStringSearch(e.target.value);
                    if (e.target.value.length > 0) {
                      setDisplaySearch(true);
                    } else {
                      setDisplaySearch(false);
                    }
                  }}
                />{" "}
                {displaySearch && (
                  <div className="autoCompleteContainer">
                    {allClientsData
                      ?.filter((v) => {
                        if (
                          [v.client_id + "", v.client.toLowerCase()].some((r) =>
                            r.includes(stringSearch)
                          )
                        ) {
                          return v;
                        }
                      })
                      .map((val, i) => {
                        return (
                          <div
                            onClick={() =>
                              setSearchingInput(
                                val.client_id,
                                val.client,
                                val.clientDetails,
                                val.mobile,
                                val.companyName,
                                val.street,
                                val.city,
                                val.postalCode
                              )
                            }
                            className="autoCompleteOption"
                            key={i}
                          >
                            <span>{val.client_id}</span>
                            <span>{val.client}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            <div className="addNewOrderForm">
              <div className="orderDetails">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Client name"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.clientName}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        clientName: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                  <input
                    type="text"
                    placeholder="Mobile number"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.mobile}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        mobile: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="textarea"
                    placeholder="Order details"
                    className="orderDetailsInput"
                    value={clientDetails.clientDetails}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        clientDetails: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.companyName}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        companyName: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                  <input
                    type="text"
                    placeholder="Street, house number"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.street}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        street: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="City"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.city}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        city: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                  <input
                    type="text"
                    placeholder="Postal code"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.postalCode}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        postalCode: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <select
                    className="orderDetailsSelect"
                    placeholder="Status"
                    value={clientDetails.status}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        status: e.target.value,
                      })
                    }
                    required="required"
                  >
                    <option>Visit</option>
                    <option>Open</option>
                    <option>Completed</option>
                    <option>Canceld</option>
                  </select>
                </div>
              </div>

              <div className="serviceDetails">
                <div className="newOrderTable">
                  <table>
                    <thead>
                      <tr>
                        <th>Service name</th>
                        <th>Amount</th>
                        <th>Price</th>
                        <th>Total price</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <input
                            type="text"
                            placeholder="Service name"
                            className="serviceDetailsInput"
                            value={serviceDetails.serviceName}
                            onChange={(e) =>
                              setServiceDetails({
                                ...serviceDetails,
                                serviceName: e.target.value,
                              })
                            }
                            required="required"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="1"
                            className="serviceDetailsInput"
                            value={serviceDetails.amount}
                            onChange={(e) =>
                              setServiceDetails({
                                ...serviceDetails,
                                amount: Number(e.target.value),
                              })
                            }
                            required="required"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="10.00"
                            className="serviceDetailsInput"
                            value={serviceDetails.itemPrice}
                            onChange={(e) =>
                              setServiceDetails({
                                ...serviceDetails,
                                itemPrice: Number(e.target.value),
                              })
                            }
                            required="required"
                          />
                        </td>
                        <td>
                          {serviceDetails.itemPrice * serviceDetails.amount}
                        </td>
                        <td></td>
                      </tr>
                      {clientDetails.services.map((service, key) => {
                        return (
                          <tr key={key}>
                            <td>{service.serviceName}</td>
                            <td>{service.amount}</td>
                            <td>{service.itemPrice}</td>
                            <td>{service.amount * service.itemPrice}</td>
                            <td
                              className="removeService"
                              onClick={() => removeService(key)}
                            >
                              <RemoveRoundedIcon />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="submitWrap">
            <div className="serviceSummary">
              <div className="serviceSummaryLeft">
                <span
                  className="addNewLine"
                  onClick={() => {
                    setClientDetails({
                      ...clientDetails,
                      services: [...clientDetails.services, serviceDetails],
                    });
                  }}
                >
                  + Add next service
                </span>
              </div>
              <div className="serviceSummaryRight">
                <span className="totalCost">
                  Total price of services -{" "}
                  {clientDetails.services.reduce(
                    (a, b) => a + (b.itemPrice * b.amount || 0),
                    0
                  )}
                  TK
                </span>
              </div>
            </div>
            <div className="submitNewOrder">
              <button
                className="submitNewOrderBtn"
                onClick={() => addNewOrder()}
              >
                <AddCircleOutlineRoundedIcon />
                <span className="addOrderText">Add</span>
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </div>
  );
}

export default Orders;
