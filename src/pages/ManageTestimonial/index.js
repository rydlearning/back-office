import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeleteModal from "../../components/Common/DeleteModal";
import * as Yup from "yup";
import { useFormik } from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from "axios";
import withAuth from "../withAuth";
import { baseUrl } from '../../Network';
import {
  Col,
  Container,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Label,
  Input,
  FormFeedback,
  Button,
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageTestimonial = () => {
  document.title = "Manage Testimonial | RYD Admin";

  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [testimonial, setTestimonial] = useState({});
  const [testimonials, setTestimonials] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTestimonial();
  }, [modal]);

  const fetchTestimonial = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/admin/testimonial/all`);
      setTestimonials(response.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setModal(!modal);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const enableTestimonial = async (id) => {
    try {
      setLoading(true);
      await axios.put(`${baseUrl}/admin/testimonial/enable/${id}`);
      const updatedSwaps = testimonials.map((s) =>
        s.id === id ? { ...s, status: true } : s
      );
      setTestimonials(updatedSwaps);
      toast.success("Testimonial enabled successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to accept testimonial");
    } finally {
      setLoading(false);
    }
  };

  const disableTestimonial = async (id) => {
    try {
      setLoading(true);

      await axios.put(`${baseUrl}/admin/testimonial/disable/${id}`);
      const updatedSwaps = testimonials.map((s) =>
        s.id === id ? { ...s, status: false } : s
      );
      setTestimonials(updatedSwaps);
      toast.success("Testimonial disabled successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to reject testimonial");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = (status) => {
    if (status) {
      return (< span className="text-success">Enabled</span>)
    } else {
      return (< span className="text-danger">Disabled</span>)
    }
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Testimonial" />
          <Row>
            <Col lg="12">
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="mb-3">
                    <h5 className="card-title">
                      Testimonial List{" "}
                      <span className="text-muted fw-normal ms-2">
                        ({testimonials.length})
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
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xl="12">
                  {loading ? (
                    <div className="text-center mt-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Country</th>
                            <th>Testimonial</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(testimonials) && testimonials.length > 0 ? (
                            testimonials.map((testimonial, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{testimonial?.parentId ? testimonial?.parent?.firstName + " " + testimonial?.parent?.lastName : testimonial?.name}</td>
                                <td>{testimonial?.parentId ? testimonial?.parent?.email : "----"}</td>
                                <td className="">
                                  { testimonial?.parentId ? testimonial?.parent?.country : testimonial?.country}
                                </td>
                                <td className="">
                                  {testimonial?.testimonial}
                                </td>
                                <td>{checkStatus(testimonial?.status)}</td>
                                <td>
                                  <div className="d-flex gap-3">
                                    <Button
                                      color="success"
                                      onClick={() => enableTestimonial(testimonial.id)}>
                                      Enable
                                    </Button>
                                    <Button
                                      color="danger"
                                      onClick={() => disableTestimonial(testimonial.id)}
                                    >
                                      Disable
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : null}
                        </tbody>
                      </table>
                      {!Array.isArray(testimonials) || testimonials.length === 0 && (
                        <div className="text-center mt-5">
                          <h3>No data available</h3>
                        </div>
                      )}
                    </div>
                  )}

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

export default withAuth(ManageTestimonial);
