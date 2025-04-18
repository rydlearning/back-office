import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Label,
  Input,
  FormFeedback,
} from "reactstrap";
import axios from "axios";
import * as Yup from "yup";
import { useFormik } from "formik";
import DeleteModal from "../../components/Common/DeleteModal";
import Breadcrumb from "../../components/Common/Breadcrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import withAuth from "../withAuth";
import { baseUrl } from '../../Network';

const Settings = () => {
  document.title = "Dashboard | RYD Admin";

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    document.title = isEdit
      ? "Edit Admin | RYD Admin"
      : "Add New Admin | RYD Admin";
  }, [isEdit]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/admin/all`);
      setAdmins(response.data.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    setIsEdit(false);
    setSelectedAdmin(null);
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: selectedAdmin ? selectedAdmin.fullName : "",
      email: selectedAdmin ? selectedAdmin.email : "",
      password: "",
      displayName: selectedAdmin ? selectedAdmin.displayName : "",
      role: selectedAdmin ? selectedAdmin.role.toString() : "0",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Please Enter Full Name"),
      email: Yup.string().email().required("Please Enter Email"),
      password: Yup.string().required("Please Enter Password"),
      displayName: Yup.string().required("Please Enter Display Name"),
      role: Yup.string().required("Please Select Role"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        if (isEdit) {
          await editAdmin(values);
        } else {
          await createAdmin(values);
        }
        resetForm();
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  const editAdmin = async (values) => {
    try {
      
      const url = `${baseUrl}/admin/auth/${selectedAdmin.id}`;
      const response = await axios.put(`${baseUrl}${url}`, values);
      const responseData = response.data;

      const updatedAdmins = admins.map((admin) =>
        admin.id === selectedAdmin.id ? responseData : admin
      );
      setAdmins(updatedAdmins);
      toast.success("Admin updated successfully");

      toggleModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const createAdmin = async (values) => {
    try {
     
      const url = `${baseUrl}/admin/auth/create`;
      const response = await axios.post(`${baseUrl}${url}`, values);
      const responseData = response.data;

      const updatedAdminList = await axios.get(`${baseUrl}/admin/all`);
      setAdmins(updatedAdminList.data.data);
      toast.success("Admin created successfully");

      toggleModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsEdit(true);
    toggleModal();
  };

  const handleDeleteAdmin = async (admin) => {
    try {
      if (admin.role === 1) {
        toast.error("Super Admin cannot be deleted");
        return;
      }

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this admin?"
      );
      if (!confirmDelete) {
        return;
      }

     
       
      await axios.delete(`${baseUrl}/admin/${admin.id}`);
      const updatedAdmins = admins.filter((a) => a.id !== admin.id);
      setAdmins(updatedAdmins);
      toast.success("Admin deleted successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboard" breadcrumbItem="Settings" />
          <Row>
            <Col>
              <div className="mb-3">
                <h5 className="card-title">
                  Admin List
                  <span className="text-muted fw-normal ms-2">
                    ({admins.length})
                  </span>
                </h5>
              </div>
              <Row className="align-items-center">
                <Col lg="12">
                  <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
                    <div>
                      <Link
                        to="#"
                        className="btn btn-light"
                        onClick={toggleModal}
                      >
                        <i className="bx bx-plus me-1"></i> Add New Admin
                      </Link>
                    </div>
                    <div>
                      <Input
                        type="text"
                        placeholder="Search by Name"
                        onChange={handleSearchChange}
                        value={searchTerm}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
              {loading ? (
                <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="text-center mt-5">
                  <h3>No data available</h3>
                </div>
              ) : (
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Display Name</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin, index) => (
                      <tr key={admin.id}>
                        <td>{index + 1}</td>
                        <td>{admin.fullName}</td>
                        <td>{admin.email}</td>
                        <td>{admin.displayName}</td>
                        <td>
                          {admin.role === 1 ? "Super Admin" : "Normal Admin"}
                        </td>
                        <td>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => handleEditAdmin(admin)}
                          >
                            Edit
                          </Button>{" "}
                          {admin.role === 0 && (
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteAdmin(admin)}
                            >
                              Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Col>
          </Row>
        </Container>

        <Modal isOpen={modal} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>
            {isEdit ? "Edit Admin" : "Add New Admin"}
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={validation.handleSubmit}>
              <Label for="fullName">Full Name</Label>
              <Input
                type="text"
                name="fullName"
                id="fullName"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.fullName}
                invalid={
                  validation.touched.fullName && !!validation.errors.fullName
                }
              />
              <FormFeedback>{validation.errors.fullName}</FormFeedback>
              <Label for="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.email}
                invalid={validation.touched.email && !!validation.errors.email}
              />
              <FormFeedback>{validation.errors.email}</FormFeedback>
              <Label for="password">Password</Label>
              <Input
                type="password"
                name="password"
                id="password"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.password || ""}
                invalid={
                  validation.touched.password && !!validation.errors.password
                }
              />
              <FormFeedback>{validation.errors.password}</FormFeedback>
              <Label for="displayName">Display Name</Label>
              <Input
                type="text"
                name="displayName"
                id="displayName"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.displayName}
                invalid={
                  validation.touched.displayName &&
                  !!validation.errors.displayName
                }
              />
              <FormFeedback>{validation.errors.displayName}</FormFeedback>
              <Label for="role">Role</Label>
              <Input
                type="select"
                name="role"
                id="role"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.role}
                invalid={validation.touched.role && !!validation.errors.role}
              >
                <option value="">Select Role</option>
                <option value="0">Normal Admin</option>
                <option value="1">Super Admin</option>
              </Input>
              <FormFeedback>{validation.errors.role}</FormFeedback>
              <Button className="mt-3" color="primary" type="submit">
                {isEdit ? "Update Admin" : "Add Admin"}
              </Button>{" "}
              <Button className="mt-3" color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
            </Form>
          </ModalBody>
        </Modal>

        <DeleteModal
          show={deleteModal}
          onDeleteClick={() => handleDeleteAdmin(selectedAdmin)}
          onCloseClick={() => setDeleteModal(false)}
        />

        <ToastContainer />
      </div>
    </React.Fragment>
  );
};

export default withAuth(Settings);
