import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DeleteModal from "../../components/Common/DeleteModal";
import * as Yup from "yup";
import { useFormik } from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import CustomTimezoneSelect from "../CustomTimezoneSelect";
import withAuth from "../withAuth";
import axios from "axios";
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
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from '../../Network';

const ManageChild = () => {
  document.title = "Manage Partner Child | RYD Admin";

  const [users, setUsers] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [contact, setContact] = useState({});
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // fetchParents();
    fetchChildren();
  }, []);

  const { id } = useParams()

//   const fetchParents = async () => {
//     try {
//       const response = await axios.get(`${baseUrl}/admin/parent/all`);
//       setParentOptions(response.data.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      age: contact.age || "",
      gender: contact.gender || "",
      parentId: contact.parentId || "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Please Enter Child's First Name"),
      lastName: Yup.string().required("Please Enter Child's Last Name"),
      age: Yup.string().required("Please Enter Child's Age"),
      gender: Yup.string().required("Please Enter Child's Gender"),
      parentId: Yup.string().required("Please Select a Parent"),
    }),

    onSubmit: async (values) => {
      try {
        const newChild = {
          firstName: values.firstName,
          lastName: values.lastName,
          age: values.age,
          gender: values.gender,
          parentId: values.parentId,
        };


        let response;
        if (isEdit) {

          response = await axios.put(
            `${baseUrl}/admin/partner/child/edit/${contact.id}`,
            newChild
          );
          toast.success("Child updated successfully");
        } else {
          response = await axios.post(
            `${baseUrl}/admin/child/create`,
            newChild
          );
          toast.success("Child created successfully");
        }

        const responseData = response.data;

        if (isEdit) {
          const updatedUsers = users.map((user) =>
            user.id === contact.id ? { ...user, ...responseData } : user
          );
          setUsers(updatedUsers);
        } else {
          setUsers([...users, responseData]);
        }

        toggle();
      } catch (error) {
        console.error(error);
      }
    },
  });

  const fetchChildren = async () => {
    try {
      const response = await axios.get(`${baseUrl}/admin/partner/child/all/${id}`);
      setUsers(response.data.data);
      setUsersData(response.data.data)
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const toggle = () => {
    setModal(!modal);
  };

  const handleUserClick = (userData) => {
    setContact(userData);
    setIsEdit(true);
    toggle();
  };

  const onClickDelete = (userData) => {
    setContact(userData);
    setDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${baseUrl}/admin/partner/child/${contact.id}`);
      const updatedUsers = users.filter((user) => user.id !== contact.id);
      setUsers(updatedUsers);
      setDeleteModal(false);
      toast.success("Child deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete child");
    }
  };

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteUser}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Child" />
          <Row className="align-items-center">
            <Col md={6}>
              <div className="mb-3">
                <h5 className="card-title">
                  Partner Child List{" "}
                  <span className="text-muted fw-normal ms-2">
                    ({users.length})
                  </span>
                </h5>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
                <div style={{width: 200}}>
                  <select className={'form-control'} onChange={(e) => {
                    //filter based on status
                    if (Number(e.target.value) === 1) {
                      setUsersData(users.filter(r => r?.programs?.filter(y=>y.isPaid === true && !y.isCompleted === false).length>0))
                    } else if (Number(e.target.value) === 2) {
                      setUsersData(users.filter(r => r?.programs?.filter(y=>y.isPaid === true && y.isCompleted === false).length>0))
                    } else {
                      window.location.reload()
                    }
                  }}>
                    <option value={0}>All Children</option>
                    <option value={1}>Active Program(s)</option>
                    <option value={2}>No Active Program(s)</option>
                  </select>
                </div>
                <div>
                  <Input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) =>{
                        setUsersData(users.filter((user) =>
                            `${user.firstName} ${user.lastName} ${user?.parent?.firstName} ${user?.parent?.lastName}`.toLowerCase().includes(e.target.value)
                        ))
                      }}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              <Row>
                <Col xl="12">
                  {loading ? (
                      <div className="text-center mt-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                  ) : usersData.length === 0 ? (
                      <div className="text-center mt-5">
                        <h3>No data available</h3>
                      </div>
                  ) : (
                      <table className="table align-middle">
                        <thead>
                        <tr>
                          <th>#</th>
                          <th>First Name</th>
                        <th>Last Name</th>
                        <th>Parent Name</th>
                        <th>Phone</th>
                        <th>Current Cohort</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Privacy Mode</th>
                        <th>Action</th>
                      </tr>
                      </thead>
                      <tbody>
                        {usersData.map((user, index) => (
                            <tr key={index} style={{backgroundColor: (user?.parent?.privacyMode || user?.privacyMode) ? '#ffeff2' : '#fff'}}>
                              <td>{index + 1}</td>
                              <td>{user?.firstName}</td>
                              <td>{user.lastName}</td>
                              <td>{user?.parent?.firstName} {user?.parent?.lastName}</td>
                              <td>{user?.parent?.phone}</td>
                              <td>{user?.programs?(user?.programs[0]?.cohort?.title || "No Cohort"):"No Cohort"}</td>
                              <td>{user.age}</td>
                              <td>{user.gender}</td>
                              <td>{(user?.parent?.privacyMode || user?.privacyMode) ? "Private" : "Not Private"}</td>
                              <td>
                                <div className="d-flex gap-3">
                                  <Link
                                      className="text-success"
                                      to="#"
                                      onClick={() => {
                                        handleUserClick(user);
                                        setIsEdit(true);
                                      }}
                                  >
                                    <i className="mdi mdi-pencil font-size-18"></i>
                                  </Link>
                                  <Link
                                      className="text-danger"
                                      to="#"
                                      onClick={() => onClickDelete(user)}
                                  >
                                    <i className="mdi mdi-delete font-size-18"></i>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle}>
                      {isEdit ? "Edit Child" : "Add New Child"}
                    </ModalHeader>
                    <ModalBody>
                      <Form onSubmit={validation.handleSubmit}>
                        <Row>
                          <Col xs={12}>
                            <div className="mb-3">
                              <Label className="form-label">First Name</Label>
                              <Input
                                name="firstName"
                                type="text"
                                placeholder="First Name"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.firstName || ""}
                                invalid={
                                  validation.touched.firstName &&
                                  validation.errors.firstName
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.firstName}
                              </FormFeedback>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">Last Name</Label>
                              <Input
                                name="lastName"
                                type="text"
                                placeholder="Last Name"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.lastName || ""}
                                invalid={
                                  validation.touched.lastName &&
                                  validation.errors.lastName
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.lastName}
                              </FormFeedback>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">Age</Label>
                              <Input
                                name="age"
                                type="text"
                                placeholder="Age"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.age || ""}
                                invalid={
                                  validation.touched.age &&
                                  validation.errors.age
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.age}
                              </FormFeedback>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">Gender</Label>
                              <Input
                                type="select"
                                name="gender"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.gender || ""}
                                invalid={
                                  validation.touched.gender &&
                                  validation.errors.gender
                                }
                              >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="other">Other</option>
                              </Input>
                              <FormFeedback type="invalid">
                                {validation.errors.gender}
                              </FormFeedback>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <div className="text-end">
                              {!isEdit ? (
                                <button
                                  type="submit"
                                  className="btn btn-primary save-user"
                                >
                                  Create Child
                                </button>
                              ) : (
                                <button
                                  type="submit"
                                  className="btn btn-primary save-user"
                                >
                                  Update Child
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

export default withAuth(ManageChild);
