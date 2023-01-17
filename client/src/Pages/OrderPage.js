import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./Styles/orderPage.css";
import Popup from "../Components/Popup";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

function OrderPage() {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState({});
  const [buttonPopup, setButtonPopup] = useState(false);
  const [orderUpdated, setOrderUpdated] = useState(false);
  const [deletedItems, setDeletedItems] = useState({ ids: [] });

  const [clientDetails, setClientDetails] = useState({});

  const [serviceDetails, setServiceDetails] = useState({
    serviceName: "",
    amount: 1,
    itemPrice: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/order_by_id?id=${orderId}&type=single`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data != null) {
          setOrderUpdated(false);
          setOrderData({
            order: res.data[0],
            services: res.data[1],
            client: res.data[2],
          });
        }
      });
  }, [orderUpdated]);

  const removeService = (id) => {
    let array = clientDetails.services;
    const newList = array.filter((item) => item.id !== id);

    if (id !== -1) {
      setClientDetails({
        ...clientDetails,
        services: newList,
      });
      setDeletedItems({
        ...deletedItems,
        ids: [...deletedItems.ids, id],
      });
    }
  };

  const saveOrderChanges = () => {
    axios
      .post(
        "http://localhost:5000/updateorder",
        {
          clientDetails,
          orderId,
          deletedItems,
        },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data === "success") {
          setOrderUpdated(true);
        }
      });
  };

  const OrderPageHeaderSection = () => {
    return (
      <div className="orderPageHeader">
        <h1>
          Order
          <font className="maincolor">#{orderId}</font>
        </h1>
      </div>
    );
  };

  const OrderPageContentSection = ({ props }) => {
    return <div className="orderPageSection">{props.children}</div>;
  };

  const ServicesSummaryTable = () => {
    return (
      <div className="servicesSummary">
        <table>
          <thead>
            <tr>
              <th className="summaryHeader">Services</th>
              <th className="alignCenter">Amount</th>
              <th className="alignCenter">Price</th>
              <th className="alignCenter">Total price</th>
            </tr>
          </thead>
          <tbody>
            {orderData.services?.map((service) => {
              return (
                <tr key={service.id}>
                  <td>{service.serviceName}</td>
                  <td className="alignCenter">x{service.amount}</td>
                  <td className="alignCenter">
                    {service.itemPrice}
                    TK
                  </td>
                  <td className="alignCenter">
                    {service.totalPrice}
                    TK
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const OrderDetailsSection = () => {
    return (
      <div className="orderDetails">
        <div className="orderDetailsRow">
          <h3 className="summaryHeader">Client info</h3>
        </div>
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">Client name</div>
          <div className="orderDetailsRight">
            {orderData.client ? orderData.client.client : ""}
          </div>
        </div>
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">Mobile number</div>
          <div className="orderDetailsRight">
            {orderData.client ? orderData.client.mobile : ""}
          </div>
        </div>
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">Additional info</div>
          <div className="orderDetailsRight">
            {orderData.client ? orderData.client.clientDetails : ""}
          </div>
        </div>
      </div>
    );
  };

  const UserColumnSection = () => {
    return (
      <div className="userColumn">
        <h3 className="summaryHeader">Added by:</h3>
        <div className="userColumnRow">
          <div className="orderDetailsLeft">
            <p className="userInfo">
              {orderData.order ? orderData.order.workerName : ""}
            </p>
          </div>
          <div className="orderDetailsRight">
            <button
              className="editOrderButton"
              onClick={() => {
                setButtonPopup(true);
                setClientDetails(JSON.parse(JSON.stringify(orderData)));
                setDeletedItems({ ids: [] });
              }}
            >
              <EditRoundedIcon />
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  const OrderSummarySection = () => {
    return (
      <div className="orderSummary orderDetails">
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">
            <h3 className="summaryHeader">Summary</h3>
          </div>
          <div className="orderDetailsRight">
            <span
              className={`orderStatusSummary ${
                orderData.order ? orderData.order.status : ""
              }`}
            >
              {orderData.order ? orderData.order.status : ""}
            </span>
          </div>
        </div>
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">Date</div>
          <div className="orderDetailsRight">
            {orderData.order ? orderData.order.date.split("T")[0] : ""}
          </div>
        </div>
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">Total price</div>
          <div className="orderDetailsRight">
            {orderData.order ? orderData.order.price : ""}
          </div>
        </div>
      </div>
    );
  };

  const OrderShippmentSection = () => {
    return (
      <div className="orderDetails deliveryDetails">
        <h3 className="summaryHeader">Address</h3>
        <div className="orderDetailsRow">
          <font className="bold">Company Name:&nbsp;</font>
          {orderData.client ? orderData.client.companyName : ""}
        </div>
        <div className="orderDetailsRow">
          <font className="bold">City:&nbsp;</font>
          {orderData.client ? orderData.client.city : ""}
        </div>
        <div className="orderDetailsRow">
          <font className="bold">Postal code:&nbsp;</font>
          {orderData.client ? orderData.client.postalCode : ""}
        </div>
        <div className="orderDetailsRow">
          <font className="bold">Street, House number:&nbsp;</font>
          {orderData.client ? orderData.client.street : ""}
        </div>
      </div>
    );
  };

  return (
    <div className="bodyWrap">
      <div className="orderPageContentWrap">
        <OrderPageHeaderSection />
        <div className="orderPageSection">
          <div className="orderPageLeftSide">
            <ServicesSummaryTable />
            <OrderDetailsSection />
          </div>

          <div className="orderPageRightSide">
            <UserColumnSection />
            <OrderSummarySection />
            <OrderShippmentSection />
          </div>
        </div>
      </div>

      <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
        <div className="popupWrap">
          <h3>
            Edit order
            <font className="maincolor bold">#{orderId}</font>
          </h3>
          <div className="addNewOrderWrap">
            <div className="addNewOrderForm">
              <div className="orderDetails">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Client name"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={
                      clientDetails.client ? clientDetails.client.client : ""
                    }
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        client: {
                          ...clientDetails.client,
                          client: e.target.value,
                        },
                      })
                    }
                    required="required"
                  />
                  <input
                    type="text"
                    placeholder="Mobile number"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={
                      clientDetails.client ? clientDetails.client.mobile : ""
                    }
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        client: {
                          ...clientDetails.client,
                          mobile: e.target.value,
                        },
                      })
                    }
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="textarea"
                    placeholder="Order details"
                    className="orderDetailsInput"
                    value={
                      clientDetails.client
                        ? clientDetails.client.clientDetails
                        : ""
                    }
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        client: {
                          ...clientDetails.client,
                          clientDetails: e.target.value,
                        },
                      })
                    }
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={
                      clientDetails.client ? clientDetails.client.companyName : ""
                    }
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        client: {
                          ...clientDetails.client,
                          companyName: e.target.value,
                        },
                      })
                    }
                    required="required"
                  />
                  <input
                    type="text"
                    placeholder="Street, home number"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={
                      clientDetails.client ? clientDetails.client.street : ""
                    }
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        client: {
                          ...clientDetails.client,
                          street: e.target.value,
                        },
                      })
                    }
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="City"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={
                      clientDetails.client ? clientDetails.client.city : ""
                    }
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        client: {
                          ...clientDetails.client,
                          city: e.target.value,
                        },
                      })
                    }
                    required="required"
                  />
                  <input
                    type="text"
                    placeholder="Postal code"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={
                      clientDetails.client
                        ? clientDetails.client.postalCode
                        : ""
                    }
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        client: {
                          ...clientDetails.client,
                          postalCode: e.target.value,
                        },
                      })
                    }
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <select
                    className="orderDetailsSelect"
                    placeholder="Pick status"
                    value={
                      clientDetails.order ? clientDetails.order.status : ""
                    }
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        order: {
                          ...clientDetails.order,
                          status: e.target.value,
                        },
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
                      {clientDetails.services?.map((service2) => {
                        return (
                          <tr key={service2.id}>
                            <td>{service2.serviceName}</td>
                            <td>{service2.amount}</td>
                            <td>{service2.itemPrice}</td>
                            <td>{service2.amount * service2.itemPrice}</td>
                            <td
                              className="removeService"
                              onClick={() => removeService(service2.id)}
                            >
                              -
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
                  {clientDetails.services?.reduce(
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
                onClick={() => saveOrderChanges()}
              >
                <span className="addOrderText">Save changes</span>
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </div>
  );
}

export default OrderPage;
