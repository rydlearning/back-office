import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeleteModal from "../../components/Common/DeleteModal";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from "axios";
import withAuth from "../withAuth";
import CountrySelect from '../Custom/anibe/CountrySelect';
import TimezoneSelect from '../Custom/anibe/TimezoneSelect';
import InviteTeacherModal from "./InviteTeacherModal";
import { Col, Container, Row, Modal, ModalHeader, ModalBody, Form, Label, Input, FormFeedback } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { baseUrl } from '../../Network';

const ManageTeacher = () => {
  document.title = "Manage Teacher | RYD Admin";

  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [teacherData, setTeacherData] = useState({});
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, [modal]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/admin/teacher/all`);
      setTeachers(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const toggle = () => {
    setModal(!modal);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setSelectedTimezone("");
  };

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone);
  };

  const handleTeacherClick = (teacher) => {
    if (teacher) {
      setTeacherData(teacher);
      setIsEdit(true);
      toggle();
    }
  };

  const onClickDelete = (teacher) => {
    if (teacher) {
      setTeacherData(teacher);
      setDeleteModal(true);
    } else {
      console.error("Teacher data is undefined.");
    }
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: teacherData.firstName || "",
      lastName: teacherData.lastName || "",
      email: teacherData.email || "",
      password: teacherData.password || "",
      gender: teacherData.gender || "",
      phone: teacherData.phone || "",
      qualification: teacherData.qualification || "",
      classLink: teacherData.classLink || "",
      docUrl: teacherData.docUrl || "",
      experience: teacherData.experience || "",

    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().required("Password is required"),
      gender: Yup.string().required("Gender is required"),
      phone: Yup.string().required("Phone number is required"),
      qualification: Yup.string().required("Qualification is required"),
      docUrl: Yup.string().required("Document URL is required"),
      experience: Yup.string().required("Work Experience is required"),
    }),
    onSubmit: async (values) => {
      try {
        const newTeacher = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          gender: values.gender,
          phone: values.phone,
          qualification: values.qualification,
          docUrl: values.docUrl,
          classLink: values.classLink,
          experience: values.experience,
        };


        let response;
        if (isEdit) {

          response = await axios.put(
            `${baseUrl}/admin/teacher/edit/${teacherData.id}`,
            newTeacher
          );
          toast.success("Teacher updated successfully");
        } else {

          response = await axios.post(
            `${baseUrl}/admin/teacher/create`,
            newTeacher
          );
          toast.success("Teacher created successfully");
        }

        const responseData = response.data;

        if (isEdit) {
          const updatedTeachers = teachers.map((teacher) =>
            teacher.id === teacherData.id ? { ...teacher, ...responseData } : teacher
          );
          setTeachers(updatedTeachers);
        } else {
          setTeachers([...teachers, responseData]);
        }

        toggle();
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  const handleDeleteTeacher = async () => {
    try {

      await axios.delete(`${baseUrl}/admin/teacher/${teacherData.id}`);
      const updatedTeachers = teachers.filter(
        (teacher) => teacher.id !== teacherData.id
      );
      setTeachers(updatedTeachers);
      setDeleteModal(false);
      toast.success("Teacher deleted successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete teacher");
    }
  };

  const inviteTeacher = async (email) => {
    try {
      const response = await axios.post(`${baseUrl}/admin/invite/teacher`, {
        email,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const removeInviteTeacher = async (id) => {
    try {

      const response = await axios.delete(
        `${baseUrl}/admin/remove/invite/teacher/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleInviteModal = () => {
    setInviteModalOpen(!inviteModalOpen);
  };

  const shortenUrl = (url, maxLength) => {
    if (url.length <= maxLength) {
      return url;
    } else {
      return url.substring(0, maxLength) + "...";
    }
  };

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteTeacher}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Teacher" />
          <Row>
            <Col lg="12">
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="mb-3">
                    <h5 className="card-title">
                      Teacher List{" "}
                      <span className="text-muted fw-normal ms-2">
                        ({teachers.length})
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
                      {/*  <Link
                        to="#"
                        className="btn btn-light"
                        onClick={() => {
                          setTeacherData({});
                          setIsEdit(false);
                          toggle();
                        }}
                      >
                        <i className="bx bx-plus me-1"></i> Add New Teacher
                      </Link>

                      */}


                      <Link
                        to="#"
                        className="ms-2 btn btn-primary"
                        onClick={() => {
                          setTeacherData({});
                          setIsEdit(false);
                          toggleInviteModal(); // Open invite teacher modal
                        }}
                      >
                        <i className="mdi mdi-email-variant me-1"></i> Invite
                        Teacher
                      </Link>
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
                   ) : teachers.length === 0 ? (
                     <div className="text-center mt-5">
                       <h3>No data available</h3>
                     </div>
                   ) : (
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Firstname</th>
                          <th>Lastname</th>
                          <th>Email</th>
                          <th>Gender</th>
                          <th>Phone</th>
                          <th>Country</th>
                          <th>Timezone</th>
                          <th>Cert.</th>
                          <th>Docs</th>
                          <th>Experience</th>
                          <th>Class Link</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                      {Array.isArray(teachers) &&
                          teachers.map((teacher, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{teacher.firstName}</td>
                                <td>{teacher.lastName}</td>
                                <td>{teacher.email}</td>
                                <td>{teacher.gender}</td>
                                <td>{teacher.phone}</td>
                                <td>{teacher.country}</td>
                                <td>{teacher.timezone}</td>
                                <td>{teacher.qualification}</td>
                                <td>
                                  <a target={'_blank'} rel="noopener noreferrer" href={teacher.docUrl}>Docs</a>
                                </td>
                                <td>{teacher.experience}</td>
                                <td>
                                  <a target={'_blank'} rel="noopener noreferrer" href={teacher.classLink}><i className="mdi mdi-link font-size-18"></i></a>
                                </td>
                                <td>
                                  <div className="d-flex gap-3">
                                    <Link
                                        title={"Update teacher info"}
                                        className="text-success"
                                        to="#"
                                        onClick={() => handleTeacherClick(teacher)}
                                    >
                                      <i className="mdi mdi-pencil font-size-18"></i>
                                    </Link>
                                    <Link
                                        title={"Remove teacher info"}
                                        className="text-danger"
                                        to="#"
                                        onClick={() => onClickDelete(teacher)}>
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
                      {isEdit ? "Edit Teacher" : "Add New Teacher"}
                    </ModalHeader>
                    <ModalBody>
                      <Form onSubmit={validation.handleSubmit}>
                        <Row>
                          <Col xs={12}>
                            <Row>
                              <Col xs={12} md={6}>
                                <div className="mb-3">
                                  <Label className="form-label">Firstname</Label>
                                  <Input
                                    name="firstName"
                                    type="text"
                                    placeholder="First Name"
                                    onChange={validation.handleChange}
                                    value={validation.values.firstName}
                                    invalid={validation.errors.firstName}
                                  />
                                  {validation.errors.firstName && (
                                    <FormFeedback>{validation.errors.firstName}</FormFeedback>
                                  )}
                                </div>
                              </Col>
                              <Col xs={12} md={6}>
                                <div className="mb-3">
                                  <Label className="form-label">Lastname</Label>
                                  <Input
                                    name="lastName"
                                    type="text"
                                    placeholder="Last Name"
                                    onChange={validation.handleChange}
                                    value={validation.values.lastName}
                                    invalid={validation.errors.lastName}
                                  />
                                  {validation.errors.lastName && (
                                    <FormFeedback>{validation.errors.lastName}</FormFeedback>
                                  )}
                                </div>
                              </Col>
                            </Row>
                            <div className="mb-3">
                              <Label className="form-label">Email</Label>
                              <Input
                                name="email"
                                type="email"
                                placeholder="Email"
                                onChange={validation.handleChange}
                                value={validation.values.email}
                                invalid={validation.errors.email}
                              />
                              {validation.errors.email && (
                                <FormFeedback>{validation.errors.email}</FormFeedback>
                              )}
                            </div>
                            {!isEdit && (
                                <>
                                  <div className="mb-3">
                                    <Label className="form-label">Password</Label>
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="Password"
                                        onChange={validation.handleChange}
                                        value={validation.values.password}
                                        invalid={validation.errors.password}
                                    />
                                    {validation.errors.password && (
                                        <FormFeedback>{validation.errors.password}</FormFeedback>
                                    )}

                                  </div>


                                </>

                            )}
                            <Row>
                              <Col xs={12} md={6}>
                                <div className="mb-3">
                                  <Label className="form-label">Gender</Label>
                                  <Input
                                    type="select"
                                    name="gender"
                                    onChange={validation.handleChange}
                                    value={validation.values.gender}
                                    invalid={validation.errors.gender}
                                  >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                  </Input>
                                  {validation.errors.gender && (
                                    <FormFeedback>{validation.errors.gender}</FormFeedback>
                                  )}
                                </div>
                              </Col>
                              <Col xs={12} md={6}>
                                <div className="mb-3">
                                  <Label className="form-label">Phone</Label>
                                  <Input
                                    name="phone"
                                    type="text"
                                    placeholder="Phone Number"
                                    onChange={validation.handleChange}
                                    value={validation.values.phone}
                                    invalid={validation.errors.phone}
                                  />
                                  {validation.errors.phone && (
                                    <FormFeedback>{validation.errors.phone}</FormFeedback>
                                  )}
                                </div>
                              </Col>
                            </Row>



                            <Row>

                              {!isEdit && (
                                  <>

                                    <div className="mb-3">
                                      <Label className="form-label">Qualification</Label>
                                      <Input
                                          name="qualification"
                                          type="text"
                                          placeholder="Qualification"
                                          onChange={validation.handleChange}
                                          value={validation.values.qualification}
                                          invalid={validation.errors.qualification}
                                      />
                                      {validation.errors.qualification && (
                                          <FormFeedback>{validation.errors.qualification}</FormFeedback>
                                      )}
                                    </div>

                                  </>




                              )}
                              {isEdit && (
                                  <>

                                      <div className="mb-3">
                                        <Label className="form-label">Class Link</Label>
                                        <Input
                                            name="classLink"
                                            type="text"
                                            placeholder="Class Link"
                                            onChange={validation.handleChange}
                                            value={validation.values.classLink}
                                            invalid={validation.errors.classLink}
                                        />
                                        {validation.errors.classLink && (
                                            <FormFeedback>{validation.errors.classLink}</FormFeedback>
                                        )}
                                      </div>

                                  </>

                              )}
                            </Row>
                            <Row>
                              <Col md={6}>
                                <div className="mb-3">
                                  <Label className="form-label">CV Document URL</Label>
                                  <Input
                                    name="docUrl"
                                    type="text"
                                    placeholder="Document URL"
                                    onChange={validation.handleChange}
                                    value={validation.values.docUrl}
                                    invalid={validation.errors.docUrl}
                                  />
                                  {validation.errors.docUrl && (
                                    <FormFeedback>{validation.errors.docUrl}</FormFeedback>
                                  )}
                                </div>
                              </Col>
                              <Col md={6}>
                                <div className="mb-3">
                                  <Label className="form-label">Work Experience</Label>
                                  <Input
                                    name="experience"
                                    type="text"
                                    placeholder="Work Experience (e.g 2 years)"
                                    onChange={validation.handleChange}
                                    value={validation.values.experience}
                                    invalid={validation.errors.experience}
                                  />
                                  {validation.errors.experience && (
                                    <FormFeedback>{validation.errors.experience}</FormFeedback>
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <div className="text-end">
                              {!isEdit ? (
                                <button
                                  type="submit"
                                  className="btn btn-primary save-teacher"
                                >
                                  Create Teacher
                                </button>
                              ) : (
                                <button
                                  type="submit"
                                  className="btn btn-primary save-teacher"
                                >
                                  Update Teacher
                                </button>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Form>
                    </ModalBody>
                  </Modal>

                  <InviteTeacherModal
                    isOpen={inviteModalOpen}
                    toggle={toggleInviteModal}
                    inviteTeacher={inviteTeacher}
                  />
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

export default withAuth(ManageTeacher);
