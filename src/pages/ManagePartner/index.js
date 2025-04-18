// Import necessary modules/components
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeleteModal from "../../components/Common/DeleteModal";
import * as Yup from "yup";
import { useFormik } from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from "axios";
import withAuth from "../withAuth";
import CountrySelect from "../CountrySelect";
import { baseUrl } from '../../Network';

import {
  Col,
  Container,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Tooltip,
  Form,
  Label,
  Input,
  FormFeedback,
  Button,
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { calculateDebt } from "../../utils";

const ManagePartner = () => {
  const [partners, setPartners] = useState([]);
  const [partner, setPartner] = useState({});
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discount, setDiscount] = useState("");
  const [editTooltipOpen, setEditTooltipOpen] = useState(false);
  const [loading, setLoading] = useState(true);


  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      discount: partner.value || ""
    },
    validationSchema: Yup.object({
      discount: Yup.number().required("Please Enter Discount"),
    }),

    onSubmit: async (values) => {
      try {
        const approvePartner = {
          discount: values.discount,
          id: partner.id
        };


        let response = await axios.put(
          `${baseUrl}/admin/partner/approve`,
          approvePartner
        );
        toast.success("Partner updated successfully");

        const responseData = response.data;
        const updatedPartners = partners.map((p) =>
          p.id === partner.id ? { ...p, ...responseData } : p
        );
        setPartners(updatedPartners);

        toggle();
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });


  useEffect(() => {
    //Title
    window.document.title = "Partner - RYD Admin"
    fetchPartners();
  }, [modal]);

  const fetchPartners = async () => {
    try {
      const response = await axios.get(`${baseUrl}/admin/partner/all`);
      setPartners(response.data.data);
      setLoading(false); // Update loading state after data fetch
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggle = () => {
    setModal(!modal);
  };

  const handleCreateDiscountClick = (partnerData) => {
    setPartner(partnerData);
    toggle();
  };

  const handleUpdateDiscountClick = (partnerData) => {
    setPartner(partnerData);
    toggle();
  };


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredParners = partners.filter(partner =>
    partner.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDisablePartner = async (id) => {
    setLoading(true)
    try {
      const response = await axios.put(`${baseUrl}/admin/partner/disable/${id}`);
      if (!response.status) {
        toast.error(response.message);
        return;
      }
      toast.success("Partner disabled successfully");
      const responseData = response.data;
      const updatedPartners = partners.map((p) =>
        p.id === partner.id ? { ...p, ...responseData } : p
      );
      setPartners(updatedPartners);
      fetchPartners()
    } catch (error) {
      toast.error("Failed to disable partner");
    }
  };

  const handleEnablePartner = async (id) => {
    setLoading(true)
    try {
      const response = await axios.put(`${baseUrl}/admin/partner/enable/${id}`);
      if (!response.status) {
        toast.error(response.message);
        return;
      }
      toast.success("Partner enabled successfully");
      const responseData = response.data;
      const updatedPartners = partners.map((p) =>
        p.id === partner.id ? { ...p, ...responseData } : p
      );
      setPartners(updatedPartners);
      fetchPartners()
    } catch (error) {
      toast.error("Failed to enable partner");
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Partners" />
          <Row>
            <Col lg="12">
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="mb-3">
                    <h5 className="card-title">
                      Partner List{" "}
                      <span className="text-muted fw-normal ms-2">
                        ({partners.length})
                      </span>
                    </h5>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
                    <div>
                      <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearch}
                      />
                    </div>
                    <div>
                      <button
                        className="btn btn-light d-none"
                        onClick={() => {
                          setPartner({});
                          setIsEdit(false);
                          toggle();
                        }}>
                        <i className="bx bx-plus me-1"></i> Add New Partner
                      </button>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xl="12" className={'divTable'}>
                  {loading ? (
                    <div className="text-center mt-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : filteredParners.length === 0 ? (
                    <div className="text-center mt-5">
                      <h3>No data available</h3>
                    </div>
                  ) : (
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Organization Name</th>
                          <th>Address</th>
                          <th>email</th>
                          <th>Discount (%)</th>
                          <th>Debt</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParners.map((p, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{p?.organizationName}</td>
                            <td>{p?.address}</td>
                            <td>{p?.email}</td>
                            <td>{p.discount}%</td>
                            <td>CAD{calculateDebt(p.programs)}</td>
                            <td>{p.approved ? "Approved" : "Unapproved"}</td>
                            <td>
                              <div className="d-flex gap-3">
                                {p.approved ?
                                    <>
                                      <Tooltip
                                          isOpen={editTooltipOpen}
                                          target="edit"
                                          toggle={() => setEditTooltipOpen(!editTooltipOpen)}
                                          placement="top"
                                          delay={{show: 100, hide: 100}}
                                      >
                                        Edit
                                      </Tooltip>
                                      <Link
                                          className="text-success"
                                          to="#"
                                          id="edit"
                                          onMouseEnter={() => setEditTooltipOpen(true)}
                                          onMouseLeave={() => setEditTooltipOpen(false)}
                                          onClick={() => {
                                            handleUpdateDiscountClick(p);
                                            setIsApprove(false);
                                            setDiscount(p.discount)
                                          }}
                                      >
                                        <i className="mdi mdi-pencil font-size-18"></i>
                                      </Link>
                                    </> : <i className="mdi mdi-pencil font-size-18"></i>}
                                {p.status ?
                                    <Link
                                        className="text-danger"
                                        onClick={() => {
                                          if (confirm("Do you really want to DISABLE " + p?.organizationName + " ?")) {
                                            handleDisablePartner(p.id)
                                          }
                                        }}
                                        id="manage"
                                    >
                                      <span className="">Restrict Account</span>
                                    </Link> : <a href="#"
                                                 className="text-success"
                                                 onClick={() => {
                                                   if (confirm("Do you really want to ENABLE " + p?.organizationName + " ?")) {
                                                     handleEnablePartner(p.id)
                                                   }
                                                 }}>
                                      Remove Restriction</a>}
                                {p.approved ?
                                    <Link
                                        className="text-[#1671D9]"
                                        to={`/partner/dashboard/${p.id}`}
                                        onClick={() => toggleRevoke(p.id)}
                                        id="manage"
                                    >
                                      <span className="">Manage Partner</span>
                                    </Link> : <Link className="text-[#000]"
                                                    onClick={() => {
                                                      handleCreateDiscountClick(p);
                                                      setIsApprove(true);
                                                    }}>
                                      Approve
                                    </Link>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>


                  )}
                  <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle}>
                      {isApprove ? "Add Discount" : "Edit Discount"}
                    </ModalHeader>
                    <ModalBody>
                      <Form onSubmit={validation.handleSubmit}>
                        <Row>
                          <Col xs={12}>
                            <div className="mb-3">
                              <Label className="form-label">Discount</Label>
                              <Input
                                name="discount"
                                type="number"
                                placeholder="Discount"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.discount || discount}
                                invalid={
                                  validation.touched.discount &&
                                  validation.errors.discount
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.discount}
                              </FormFeedback>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <div className="text-end">
                              {!isApprove ? (
                                <a
                                  type="submit"
                                  className="btn btn-primary save-user"
                                >
                                  Update
                                </a>
                              ) : (
                                <button
                                  type="submit"
                                  className="btn btn-primary save-user"
                                >
                                  Approve
                                </button>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Form>
                    </ModalBody>
                  </Modal>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>
      <ToastContainer />
    </React.Fragment>
  );
};

export default withAuth(ManagePartner);
