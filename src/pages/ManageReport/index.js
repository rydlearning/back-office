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
  ModalFooter,
  ModalBody,
  Form,
  Label,
  Input,
  FormFeedback,
  Button,
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const ManageReport = () => {
  document.title = "Manage Report | RYD Admin";

  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [report, setReport] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [modal, setModal] = useState(false);
  const [viewReportModal, setViewReportModal] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  useEffect(() => {
    fetchReport();
    fetchCohorts();
  }, [modal]);


  function compareFn(a, b) {
    if (a.time < b.time && a.day < b.day) {
      return -1;
    } else if (a.time > b.time && a.day > b.day) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/admin/report/all`);
      setReport(response.data.data);

      setTimeout(() => {
        //filter to it
        const xdata = response?.data?.data;
        //setProgramsList(xdata.sort(compareFn))
        const __xdata = xdata.sort(compareFn)
        setFilteredData(__xdata)
        setLoading(false); // Update loading state after data fetch
      }, 100)
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (data) => {
    setSelectedStudent(data)
    setViewReportModal(true)
  };

  const fetchCohorts = async () => {
    try {
      const cohorts = await axios.get(`${baseUrl}/admin/cohort/all`);
      setCohorts(cohorts?.data?.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      //console.error("Error:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  function formatDate(date) {
    const currentDate = new Date(date);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-US', options).replace(/(\d+)(st|nd|rd|th)/, '$1<sup>$2</sup>');

    return formattedDate;
  }

  const checkStatus = (status) => {
    if (status) {
      return (< span className="text-success">Completed</span>)
    } else {
      return (< span className="text-danger">UnComplete</span>)
    }
  }
  console.log(selectedStudent)
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Report" />
          <Row>
            <Col lg="12">
              <Row className="align-items-center">
                <Col md={4}>
                  <div className="mb-3">
                    <h5 className="card-title">
                      Report List{" "}
                      <span className="text-muted fw-normal ms-2">
                        ({testimonials.length})
                      </span>
                    </h5>
                  </div>
                </Col>
                <Col md={8}>
                  <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
                    <div>
                      <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          // Function to filter package list based on search query
                          const searchProgrammed = report.filter((program) => `${program?.child?.firstName} ${program?.child?.lastName} `.toLowerCase().includes(e.target.value.toLowerCase()));
                          setFilteredData(searchProgrammed)
                        }}
                      />
                    </div>
                    <div>
                      <select className={'form-control'} onChange={(e) => {
                        //filter based on cohorts
                        if (Number(e.target.value) === 0) {
                          window.location.reload()
                        } else {
                          const __cohortFilter = report.filter(r => Number(r.program.cohortId) === Number(e.target.value));
                          setFilteredData(__cohortFilter)
                        }
                      }}>
                        <option value={0}>All Cohorts</option>
                        {cohorts && cohorts.map((d, i) => <option key={i}
                          value={d.id}>{d.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <select className={'form-control'} onChange={(e) => {
                        //filter based on status
                        if (Number(e.target.value) === 1) {
                          const __activeProgramFilter = report.filter(r => r.program.package.description === "Basic Learning")
                          setFilteredData(__activeProgramFilter)

                        } else if (Number(e.target.value) === 2) {
                          const __activeProgramFilter = report.filter(r => r.program.package.description === "Advance Learning")
                          setFilteredData(__activeProgramFilter)
                        } else if (Number(e.target.value) === 3) {
                          const __activeProgramFilter = report.filter(r => r.program.package.description === "Advance Special Learning")
                          setFilteredData(__activeProgramFilter)
                        } else {
                          window.location.reload()
                        }
                      }}>
                        <option value={0}>All Filter(s)</option>
                        <option value={1}>Basic Level</option>
                        <option value={2}>Advance Level</option>
                        <option value={3}>Special Level</option>
                      </select>
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
                            <th>C_Name</th>
                            <th>Course</th>
                            <th>Level</th>
                            <th>Progress</th>
                            <th>Improvement</th>
                            <th>Suggestion</th>
                            <th>A_Comment </th>
                            <th>P_Comment</th>
                            <th>C_Completed</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(filteredData) && filteredData.length > 0 ? (
                            filteredData.slice().reverse()?.map((report, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{report?.child?.firstName + " " + report?.child?.lastName}</td>
                                <td>{report?.program?.package?.name}</td>
                                <td>{report?.program?.package?.title}</td>
                                <td>{report?.progressNotes}</td>
                                <td className="">
                                  {report?.areasForImprovement}
                                </td>
                                <td className="">
                                  {report?.supportSuggestions}
                                </td>
                                <td className="">
                                  {report?.additionalComments}
                                </td>
                                <td className="">
                                  {report?.parentComments}
                                </td>
                                <td>{checkStatus(report?.cohortCompleted)}</td>
                                <td>
                                  <div className="d-flex gap-3">
                                    <Button
                                      color="success"
                                      onClick={() => toggle(report)}>
                                      View Report
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : null}
                        </tbody>
                      </table>
                      {!Array.isArray(filteredData) || filteredData.length === 0 && (
                        <div className="text-center mt-5">
                          <h3>No data available</h3>
                        </div>
                      )}
                    </div>
                  )}

                </Col>
              </Row>

              <Modal isOpen={viewReportModal} toggle={() => setViewReportModal(!viewReportModal)} size="lg">
                <ModalHeader toggle={() => setViewReportModal(!viewReportModal)}>
                  Student Report
                </ModalHeader>
                <ModalBody>
                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="row mb-4">
                        <div className="col-md-3 mb-3 mb-md-0">
                          <div className="mb-2 text-muted small">Student Name</div>
                          <div className="fw-medium">
                            {selectedStudent?.child?.firstName} {selectedStudent?.child?.lastName}
                          </div>
                        </div>
                        <div className="col-md-3 mb-3 mb-md-0">
                          <div className="mb-2 text-muted small">Course</div>
                          <div className="fw-medium">
                            {selectedStudent?.name}
                          </div>
                        </div>
                        <div className="col-md-3 mb-3 mb-md-0">
                          <div className="mb-2 text-muted small">Level</div>
                          <div className="fw-medium">  {selectedStudent?.program?.package?.title.replace(/Program/g, '')}</div>
                        </div>
                        <div className="col-md-3">
                          <div className="mb-2 text-muted small">Date</div>
                          <div className="fw-medium">
                            {selectedStudent?.createdAt ?
                              formatDate(selectedStudent?.createdAt) :
                              new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="d-flex align-items-center mb-3">
                          <span className="badge bg-primary me-2">&nbsp;</span>
                          Progress Summary
                        </h5>
                        <div className="bg-light p-3 rounded">
                          <p className="mb-0 text-pre-wrap">
                            {selectedStudent?.progressNotes}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="d-flex align-items-center mb-3">
                          <span className="badge bg-warning me-2">&nbsp;</span>
                          Areas for Improvement
                        </h5>
                        <div className="bg-light p-3 rounded">
                          <p className="mb-0 text-pre-wrap">
                            {selectedStudent?.areasForImprovement}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="d-flex align-items-center mb-3">
                          <span className="badge bg-success me-2">&nbsp;</span>
                          Parent Support Suggestions
                        </h5>
                        <div className="bg-light p-3 rounded">
                          <p className="mb-0 text-pre-wrap">
                            {selectedStudent?.supportSuggestions}
                          </p>
                        </div>
                      </div>

                      {selectedStudent?.additionalComments && (
                        <div className="mb-4">
                          <h5 className="d-flex align-items-center mb-3">
                            <span className="badge bg-danger me-2">&nbsp;</span>
                            Additional Comments
                          </h5>
                          <div className="bg-light p-3 rounded">
                            <p className="mb-0 text-pre-wrap">
                              {selectedStudent?.additionalComments}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                        <span className="text-muted small">Cohort Completion:</span>
                        <span className={`badge ${selectedStudent?.cohortCompleted
                          ? 'bg-success'
                          : 'bg-danger'}`}>
                          {selectedStudent?.cohortCompleted ? 'Completed' : 'Not Completed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="secondary" onClick={() => setViewReportModal(false)}>
                    Close
                  </Button>
                </ModalFooter>
              </Modal>
            </Col>
          </Row>
        </Container>
      </div>
      <ToastContainer />
    </React.Fragment>
  );
};

export default withAuth(ManageReport);
