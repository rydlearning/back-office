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
  Button,
  Form,
  Label,
  Input,
  FormFeedback,
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const ManageSurvey = () => {
  document.title = "Manage Survey | RYD Admin";

  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [survey, setSurvey] = useState({});
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: survey.title || "",
      body: survey.description || "",
      pText: survey.pText || "",
      nText: survey.nText || "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Please Enter Survey Title"),
      pText: Yup.string().required("Please Enter Positive Text"),
      nText: Yup.string().required("Please Enter Negative Text"),
      body: Yup.string().required("Please Enter Survey Description"),
    }),

    onSubmit: async (values) => {
      try {
        const newSurvey = {
          title: values.title,
          body: values.body,
          pText: values.pText,
          nText: values.nText,
        };

       
        let response;
        if (isEdit) {
          response = await axios.put(
            `${baseUrl}/admin/survey/edit/${survey.id}`,
            newSurvey
          );
          toast.success("Survey updated successfully");
        } else {
          response = await axios.post(
            `${baseUrl}/admin/survey/create`,
            newSurvey
          );
          toast.success("Survey created successfully");
        }

        const responseData = response.data;

        if (isEdit) {
          const updatedSurveys = surveys.map((s) =>
            s.id === survey.id ? { ...s, ...responseData } : s
          );
          setSurveys(updatedSurveys);
        } else {
          setSurveys([...surveys, responseData]);
        }

        toggle();
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  useEffect(() => {
    fetchSurveysAndExportResponses();
  }, [modal]);

  const fetchSurveysAndExportResponses = async () => {
    try {
      const surveysResponse = await axios.get(`${baseUrl}/admin/survey/all`);
      const surveys = surveysResponse.data.data;

      setSurveys(surveys);
      setLoading(false); // Set loading to false after fetching data
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggle = () => {
    setModal(!modal);
  };

  const handleSurveyClick = (surveyData) => {
    setSurvey(surveyData);
    setIsEdit(true);
    toggle();
  };

  const onClickDelete = (surveyData) => {
    setSurvey(surveyData);
    setDeleteModal(true);
  };

  const handleDeleteSurvey = async () => {
    try {
      await axios.delete(`${baseUrl}/admin/survey/${survey.id}`);
      const updatedSurveys = surveys.filter((s) => s.id !== survey.id);
      setSurveys(updatedSurveys);
      setDeleteModal(false);
      toast.success("Survey deleted successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete survey");
    }
  };


  useEffect(() => {
    fetchSurveysAndExportResponses();
  }, [modal]);

  


  

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const csvHeader1 = [
    "Fullname",
    "Country",
    "Parent Email",
    "Total Negative Count",
  ];
  const csvHeader2 = [
    "Fullname",
    "Email",
    "Country",
    "Total Positive Count",
  ];

  const exportSurveyResponses = () => {
    const data = surveys.flatMap((survey, index) => {
      return survey.positiveResponses.map(pos => {
        return {
          "Fullname": pos.parent.firstName + " " + pos.parent.lastName,
          "Email": pos.parent.email,
          "Country": pos.parent.country,
          "Phone Number": pos.parent.phone,
          "Total Negative Count": survey.negativeResponses.length,
          "Total Positive Count": survey.positiveResponses.length,
        };
      });
    });
  
    const workbook1 = XLSX.utils.book_new();
    const worksheet1 = XLSX.utils.json_to_sheet(data, { header: csvHeader1 });
    XLSX.utils.book_append_sheet(workbook1, worksheet1, "Negative Count");
  
    const workbook2 = XLSX.utils.book_new();
    const worksheet2 = XLSX.utils.json_to_sheet(data, { header: csvHeader2 });
    XLSX.utils.book_append_sheet(workbook2, worksheet2, "Positive Count");
  
    const excelBlob1 = new Blob(
      [XLSX.write(workbook1, { bookType: "xlsx", type: "buffer" })],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
    const excelBlob2 = new Blob(
      [XLSX.write(workbook2, { bookType: "xlsx", type: "buffer" })],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
  
    const excelUrl1 = URL.createObjectURL(excelBlob1);
    const excelUrl2 = URL.createObjectURL(excelBlob2);
  
    const link1 = document.createElement("a");
    link1.href = excelUrl1;
    link1.download = "Survey_Responses_Negative_Count.xlsx";
    document.body.appendChild(link1);
    link1.click();
  
    const link2 = document.createElement("a");
    link2.href = excelUrl2;
    link2.download = "Survey_Responses_Positive_Count.xlsx";
    document.body.appendChild(link2);
    link2.click();
  
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(excelUrl1);
      URL.revokeObjectURL(excelUrl2);
    }, 100);
  };
  

  const changeSurveyStatus = async (surveyId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/admin/survey/toggle/${surveyId}`
      );
      const updatedSurvey = response.data.data;
      const updatedSurveys = surveys.map((s) =>
        s.id === surveyId ? { ...s, status: updatedSurvey.status } : s
      );
      setSurveys(updatedSurveys);
      toast.success("Survey status updated successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update survey status");
    }
  };
   // Function to filter survey list based on search query
const filteredSurveys = surveys.filter((survey) =>
survey.title?.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteSurvey}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Survey" />
          <Row>
            <Col lg="12">
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="mb-3">
                    <h5 className="card-title">
                      Survey List{" "}
                      <span className="text-muted fw-normal ms-2">
                        ({surveys.length})
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
                      <Link
                        to="#"
                        className="btn btn-light"
                        onClick={() => {
                          setSurvey({});
                          setIsEdit(false);
                          toggle();
                        }}
                      >
                        <i className="bx bx-plus me-1"></i> Add New Survey
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
                  ) : Array.isArray(surveys) && filteredSurveys.length > 0 ? (
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Positive</th>
                          <th>Negative</th>
                          <th>Positive Total Count</th>
                          <th>Negative Total Count</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {surveys.map((s, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{s.title}</td>
                            <td>{s.body}</td>
                            <td>{s.pText}</td>
                            <td>{s.nText}</td>
                            <td>{s.positiveResponses.length}</td>
                            <td>{s.negativeResponses.length}</td>
                            <td>{s.status ? "Active" : "Inactive"}</td>
                            <td>
                              <div className="d-flex gap-3">
                                <Link
                                  className="text-secondary"
                                  onClick={() => changeSurveyStatus(s.id)}
                                >
                                  {s.status ? (
                                    <i className="mdi mdi-lock-open-variant-outline font-size-18"></i>
                                  ) : (
                                    <i className="mdi mdi-lock-outline font-size-18"></i>
                                  )}
                                </Link>
                                <Link
                                  className="text-primary"
                                  onClick={() => exportSurveyResponses(s.id)}
                                >
                                  <i className="mdi mdi-export-variant font-size-18"></i>
                                </Link>
                                <Link
                                  className="text-success"
                                  to="#"
                                  onClick={() => {
                                    handleSurveyClick(s);
                                    setIsEdit(true);
                                  }}
                                >
                                  <i className="mdi mdi-pencil font-size-18"></i>
                                </Link>
                                <Link
                                  className="text-danger"
                                  to="#"
                                  onClick={() => onClickDelete(s)}
                                >
                                  <i className="mdi mdi-delete font-size-18"></i>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center mt-5">
                      <h3>No data available</h3>
                    </div>
                  )}
                  <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle}>
                      {isEdit ? "Edit Survey" : "Add New Survey"}
                    </ModalHeader>
                    <ModalBody>
                      <Form onSubmit={validation.handleSubmit}>
                        <Row>
                          <Col xs={12}>
                            <div className="mb-3">
                              <Label className="form-label">Title</Label>
                              <Input
                                name="title"
                                type="text"
                                placeholder="Title"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.title || ""}
                                invalid={
                                  validation.touched.title &&
                                  validation.errors.title
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.title}
                              </FormFeedback>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">
                                Positive Text
                              </Label>
                              <Input
                                name="pText"
                                type="text"
                                placeholder="Positive"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.pText || ""}
                                invalid={
                                  validation.touched.pText &&
                                  validation.errors.pText
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.pText}
                              </FormFeedback>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">
                                Negative Text
                              </Label>
                              <Input
                                name="nText"
                                type="text"
                                placeholder="Negative"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.nText || ""}
                                invalid={
                                  validation.touched.nText &&
                                  validation.errors.nText
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.nText}
                              </FormFeedback>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">Description</Label>
                              <Input
                                name="body"
                                type="textarea"
                                placeholder="Description"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.body || ""}
                                invalid={
                                  validation.touched.body &&
                                  validation.errors.body
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.body}
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
                                  Create Survey
                                </button>
                              ) : (
                                <button
                                  type="submit"
                                  className="btn btn-primary save-user"
                                >
                                  Update Survey
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

export default withAuth(ManageSurvey);
