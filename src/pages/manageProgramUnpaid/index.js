import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import DeleteModal from "../../components/Common/DeleteModal";
import * as Yup from "yup";
import {useFormik} from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from "axios";
import {
    Col,
    Container,
    Tooltip,
    Label,
    Row,
    Modal,
    ModalHeader,
    ModalBody,
    Form,
    Input,
    FormFeedback,
} from "reactstrap";
import withAuth from "../withAuth";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {baseUrl} from '../../Network';

export const times = [
    {label: "1:00AM", value: 1},
    {label: "2:00AM", value: 2},
    {label: "3:00AM", value: 3},
    {label: "4:00AM", value: 4},
    {label: "5:00AM", value: 5},
    {label: "6:00AM", value: 6},
    {label: "7:00AM", value: 7},
    {label: "8:00AM", value: 8},
    {label: "9:00AM", value: 9},
    {label: "10:00AM", value: 10},
    {label: "11:00AM", value: 11},
    {label: "12:00PM", value: 12},
    {label: "1:00PM", value: 13},
    {label: "2:00PM", value: 14},
    {label: "3:00PM", value: 15},
    {label: "4:00PM", value: 16},
    {label: "5:00PM", value: 17},
    {label: "6:00PM", value: 18},
    {label: "7:00PM", value: 19},
    {label: "8:00PM", value: 20},
    {label: "9:00PM", value: 21},
    {label: "10:00PM", value: 22},
    {label: "11:00PM", value: 23},
    {label: "12:00AM", value: 24},
];

const TIMES_ = [
    "12:00AM",
    "1:00AM",
    "2:00AM",
    "3:00AM",
    "4:00AM",
    "5:00AM",
    "6:00AM",
    "7:00AM",
    "8:00AM",
    "9:00AM",
    "10:00AM",
    "11:00AM",
    "12:00PM",
    "1:00PM",
    "2:00PM",
    "3:00PM",
    "4:00PM",
    "5:00PM",
    "6:00PM",
    "7:00PM",
    "8:00PM",
    "9:00PM",
    "10:00PM",
    "11:00PM",
]

const formatTime = (time) => {
    // const hour = Math.floor(time);
    // const minute = (time - hour) * 60;
    // const meridian = hour >= 12 ? "PM" : "AM";
    // const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
    // return `${formattedHour}:${minute < 10 ? "0" : ""}${Math.floor(minute)} ${meridian}`;
    return TIMES_[time]
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const formatDay = (day) => {
    // Adjust day to be within the range of 0 to 6
    //const adjustedDay = (((day - 1) % 7) + 7) % 7;
    return days[day];
};

const ManageProgram = () => {
    document.title = "Manage Program | RYD Admin";

    const [programs, setPrograms] = useState([]);
    const [programsList, setProgramsList] = useState([]);
    const [contact, setContact] = useState({});
    const [assigns, setAssigns] = useState({});
    const [modal, setModal] = useState(false);
    const [assignModal, setAssignModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedProgram, setSelectedProgram] = useState([]);
    const [assignError, setAssignError] = useState(false);
    const [assignTooltipOpen, setAssignTooltipOpen] = useState(false);
    const [editTooltipOpen, setEditTooltipOpen] = useState(false);
    const [deleteTooltipOpen, setDeleteTooltipOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [switchProgram, setSwitchProgram] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchPrograms();
    }, [modal]);


    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };


    const handleAssignClick = (programData) => {
        assignToggle(programData); // Pass program data to toggle for editing
        setSelectedProgram([programData]);
    };

    const handleTeacherChange = (e) => {
        setSelectedTeacher(e.target.value);
    };

    useEffect(() => {
        fetchPrograms();
    }, [modal]);

    useEffect(() => {
        fetchTeachers();
    }, []);
    const fetchPrograms = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/program/all`);
            setPrograms(response?.data?.data);
            setLoading(false);
            setTimeout(()=>{
                //filter to it
                setProgramsList(response?.data?.data.filter(r => r.isPaid === false && r.isCompleted === false))
            }, 1000)
        } catch (error) {
            setLoading(false);
            console.error("Error:", error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/teacher/all`);
            setTeachers(response.data.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const toggle = (programData) => {
        if (programData) {
            setContact(programData);
            setIsEdit(true);
        } else {
            setContact({
                level: "",
                time: "",
                day: "", // Add day field to contact state
            });
            setIsEdit(false);
        }
        setModal(!modal);
    };
    const handleTeacherAssignClick = async () => {
        if (selectedTeacher === '' || selectedProgram.length === 0) {
            setAssignError(true);
            return;
        }
        setAssignError(false);
        try {
            const response = await axios.post(`${baseUrl}/admin/program/assign/teacher`, {
                programIds: selectedProgram.map((program) => program.id),
                teacherId: selectedTeacher
            });

            // Fetch the updated programs after successful assignment
            await fetchPrograms(); // Assuming fetchPrograms function updates the programs state

            showSuccessNotification("Teacher assigned successfully.");
            setAssignModal(false);
        } catch (error) {
            console.error("Error:", error);
            showErrorNotification("Failed to assign teacher.");
        }
    };


    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            level: contact.level || "",
            time: contact.time || "",
            day: contact.day || "", // Add day field to initialValues
        },
        validationSchema: Yup.object({
            level: Yup.string().required("Please Enter Level"),
            time: Yup.string().required("Please Enter Time"),
            day: Yup.string().required("Please Select Day"), // Add validation for day field
        }),
        onSubmit: async (values) => {
            try {
                const newProgram = {
                    level: values.level,
                    time: values.time,
                    day: values.day, // Include day in newProgram object
                    isPaid: values.isPaid,
                };


                let response;
                if (isEdit) {
                    response = await axios.put(
                        `${baseUrl}/admin/program/edit/${contact.id}`,
                        newProgram
                    );
                    const responseData = response.data;

                    const updatedPrograms = programs.map((program) =>
                        program.id === contact.id
                            ? {...program, ...responseData}
                            : program
                    );
                    setPrograms(updatedPrograms);
                    showSuccessNotification("Program updated successfully.");
                } else {
                    // Handle adding new program here if needed
                }

                toggle();
            } catch (error) {
                console.error("Error:", error);
                showErrorNotification("Failed to update program.");
            }
        },
    });

    const handleDeleteProgram = async () => {
        try {

            await axios.delete(`${baseUrl}/admin/program/${contact.id}`);
            const updatedPrograms = programs.filter(
                (program) => program.id !== contact.id
            );
            setPrograms(updatedPrograms);
            setDeleteModal(false);
            showSuccessNotification("Program deleted successfully.");
        } catch (error) {
            console.error("Error:", error);
            showErrorNotification("Failed to delete program.");
        }
    };

    const onClickDelete = (programData) => {
        setContact(programData);
        setDeleteModal(true);
    };

    const assignToggle = (programData) => {
        if (programData) {
        } else {
            setContact({
                level: "",
                time: "",
                day: "",
            });
        }
        setAssignModal(!assignModal);
    };

    const handleToggleIsPaid = async (programData) => {
        try {
            if (!programData || !programData.id) {
                console.error("Invalid program data.");
                return;
            }
            const updatedProgram = {...programData, isPaid: true};
            await axios.put(
                `${baseUrl}/admin/program/edit/${programData.id}`,
                updatedProgram
            );

            const confirmMarkAsPaid = window.confirm(
                "Are you sure you want to mark this program as paid?"
            );
            if (confirmMarkAsPaid) {
                const updatedPrograms = programs.map((program) =>
                    program.id === programData.id ? updatedProgram : program
                );
                setPrograms(updatedPrograms);
                showSuccessNotification("Program marked as paid.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const addProgramToBulk = (program) => {
        const programs = [...selectedProgram];
        programs.push(program);
        setSelectedProgram(programs);
        //console.log(selectedProgram);
    };

    // Function to filter package list based on search query
    const filteredPrograms = programs.filter((program) =>
        program?.child?.firstName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleProgramClick = (programData) => {
        toggle(programData); // Pass program data to toggle for editing
    };

    return (
        <React.Fragment>
            <ToastContainer/>
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDeleteProgram}
                onCloseClick={() => setDeleteModal(false)}
            />
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Program"/>
                    <Row>
                        <Col lg="12">
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <div className="mb-3">
                                        <h5 className="card-title">
                                            Manage Program UnPaid{" "}
                                            <span className="text-muted fw-normal ms-2">
                        ({programs.length})
                      </span>
                                        </h5>
                                        <button onClick={() => {
                                            //switch program
                                            setSwitchProgram(!switchProgram)
                                                //filter to it
                                                setProgramsList(programs)
                                        }}>Show All
                                        </button>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
                                        <div>
                                            <Input
                                                type="text"
                                                placeholder="Search"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
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
                                    ) : filteredPrograms.length === 0 ? (
                                        <div className="text-center mt-5">
                                            <h3>No data available</h3>
                                        </div>
                                    ) : (
                                        <table className="table align-middle">
                                            <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>P.Name</th>
                                                <th>Phone</th>
                                                <th>Email</th>
                                                <th>C.Name</th>
                                                <th>Age</th>
                                                <th>Gender</th>
                                                <th>T.Name</th>
                                                <th>P.Title</th>
                                                <th>Ass.</th>
                                                {/*<th>Status</th>*/}
                                                <th>Level</th>
                                                <th>Time</th>
                                                <th>Day</th>
                                                <th>GMT</th>
                                                <th>Status</th>
                                                <th></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {programsList.map((program, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{program?.child?.parent?.firstName +" "+program?.child?.parent?.lastName}</td>
                                                    <td>{program?.child?.parent?.phone}</td>
                                                    <td>{program?.child?.parent?.email}</td>
                                                    <td>{program?.child?.firstName+" "+program?.child?.lastName}</td>
                                                    <td>{program?.child?.age}</td>
                                                    <td>{program?.child?.gender}</td>
                                                    <td>{program?.teacher?.firstName}</td>
                                                    <td>{program?.package?.title}</td>
                                                    <td>{program?.assessmentUrl}</td>
                                                    {/*<td>*/}
                                                    {/*  {program?.package?.status ? "Active" : "Inactive"}*/}
                                                    {/*</td>*/}
                                                    <td>{program?.package?.level}</td>
                                                    <td>{formatTime(program.time)}</td>
                                                    <td>{formatDay(program.day)}</td>

                                                    <td>{program.timeOffset}</td>
                                                    <td>
                                                         <span>
                                {program.isPaid ? (
                                    "Paid"
                                ) : (
                                    <button
                                        className="btn btn-link ms-1 text-primary"
                                        onClick={() =>
                                            handleToggleIsPaid(program)
                                        }
                                        disabled={program.isPaid}
                                    >
                                        Unpaid
                                    </button>
                                )}
                                                             {!program.isPaid && (
                                                                 <Link
                                                                     className="ms-1 text-primary"
                                                                     to="#"
                                                                     onClick={(e) => e.preventDefault()}
                                                                 ></Link>
                                                             )}
                              </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex">
                                                            <span className={'d-block'}>
                                <Link
                                    className="text-success"
                                    to="#"
                                    id="edit"
                                    onMouseEnter={() =>
                                        setEditTooltipOpen(true)
                                    }
                                    onMouseLeave={() =>
                                        setEditTooltipOpen(false)
                                    }
                                    onClick={() => handleProgramClick(program)}>
                                  <i className="mdi mdi-pencil font-size-20"></i>
                                </Link>
                              </span>
                                                            <span className={'d-none'}>
                                <Tooltip
                                    isOpen={deleteTooltipOpen}
                                    target="delete"
                                    toggle={() =>
                                        setDeleteTooltipOpen(!deleteTooltipOpen)
                                    }
                                    placement="top"
                                    delay={{show: 100, hide: 100}}
                                >
                                  Delete
                                </Tooltip>
                                <Link
                                    className="text-danger"
                                    to="#"
                                    id="delete"
                                    onMouseEnter={() =>
                                        setDeleteTooltipOpen(true)
                                    }
                                    onMouseLeave={() =>
                                        setDeleteTooltipOpen(false)
                                    }
                                    onClick={() => onClickDelete(program)}
                                >
                                  <i className="mdi mdi-delete font-size-20"></i>
                                </Link>
                              </span>
                                                            <span>
                                <Tooltip
                                    isOpen={assignTooltipOpen}
                                    target="assign"
                                    toggle={() =>
                                        setAssignTooltipOpen(!assignTooltipOpen)
                                    }
                                    placement="top"
                                    delay={{show: 100, hide: 100}}
                                >
                                  Assign Teacher
                                </Tooltip>
                                <Link
                                    className="text-primary"
                                    to="#"
                                    id="assign"
                                    onMouseEnter={() =>
                                        setAssignTooltipOpen(true)
                                    }
                                    onMouseLeave={() =>
                                        setAssignTooltipOpen(false)
                                    }
                                    onClick={() => handleAssignClick(program)}
                                >
                                  <i className="mdi mdi-clipboard-account font-size-20"></i>
                                </Link>
                              </span>

                                                            <span className={'d-none'}>
                                <Link
                                    className="text-secondary"
                                    to="#"
                                    onClick={() => addProgramToBulk(program)}
                                >
                                  <i className="mdi mdi-plus-box-multiple font-size-20"></i>
                                </Link>
                              </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    )}
                                    <Modal isOpen={modal} toggle={() => toggle()}>
                                        <ModalHeader toggle={() => toggle()}>
                                            {isEdit ? "Edit Program" : "Add New Program"}
                                        </ModalHeader>
                                        <ModalBody>
                                            <Form onSubmit={validation.handleSubmit}>
                                                <Row>
                                                    <Col xs={12}>
                                                        <div className="row">
                                                            <div className="">
                                                                <div className="mb-3">
                                                                    <Label>Level</Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="level"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.level || ""}
                                                                        invalid={
                                                                            validation.touched.level &&
                                                                            validation.errors.level
                                                                        }
                                                                    >
                                                                        <option value="">Select Level</option>
                                                                        <option value="4">4</option>
                                                                        <option value="3">3</option>
                                                                        <option value="2">2</option>
                                                                        <option value="1">1</option>
                                                                    </Input>
                                                                    <FormFeedback type="invalid">
                                                                        {validation.errors.level}
                                                                    </FormFeedback>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="mb-3">
                                                                    <Label>Day</Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="day"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.day || ""}
                                                                        invalid={
                                                                            validation.touched.day &&
                                                                            validation.errors.day
                                                                        }>
                                                                        <option value="">Select Day</option>
                                                                        {days.map((day, index) => (
                                                                            <option key={index} value={index}>
                                                                                {day}
                                                                            </option>
                                                                        ))}
                                                                    </Input>
                                                                    <FormFeedback type="invalid">
                                                                        {validation.errors.day}
                                                                    </FormFeedback>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-6">
                                                                <div className="mb-3">
                                                                    <Label>Time</Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="time"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.time || ""}
                                                                        invalid={
                                                                            validation.touched.time &&
                                                                            validation.errors.time
                                                                        }>
                                                                        <option value="">Select Time</option>
                                                                        {times.map((timeObj, index) => (
                                                                            <option key={index} value={timeObj.value}>
                                                                                {timeObj.label}
                                                                            </option>
                                                                        ))}
                                                                    </Input>
                                                                    <FormFeedback type="invalid">
                                                                        {validation.errors.time}
                                                                    </FormFeedback>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <div className="text-end">
                                                            {!isEdit ? (
                                                                <button
                                                                    type="submit"
                                                                    className="btn btn-primary save-user">
                                                                    Create Program
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="submit"
                                                                    className="btn btn-primary save-user"
                                                                >
                                                                    Update Program
                                                                </button>
                                                            )}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </ModalBody>
                                    </Modal>

                                    <Modal isOpen={assignModal} toggle={() => assignToggle()}>
                                        <ModalHeader toggle={() => assignToggle()}>Assign Teacher</ModalHeader>
                                        <ModalBody>
                                            <Form onSubmit={(e) => {
                                                e.preventDefault();
                                                handleTeacherAssignClick();
                                            }}>
                                                <Row>
                                                    <Col xs={12}>
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div className="mb-6">
                                                                    <Input
                                                                        name="teacherId"
                                                                        type="select"
                                                                        onChange={handleTeacherChange}
                                                                        onBlur={validation.handleBlur}
                                                                        // value={selectedTeacher.teacherId || ""}
                                                                        >
                                                                        <option value="">Select teacher</option>
                                                                        {teachers?.length > 0 &&
                                                                            teachers?.map((teacher) => (
                                                                                <option key={teacher?.id}
                                                                                        value={teacher?.id}>
                                                                                    {teacher.firstName} {teacher.lastName}
                                                                                </option>
                                                                            ))}
                                                                    </Input>
                                                                    <FormFeedback type="invalid">
                                                                        {validation.errors.teacherId}
                                                                    </FormFeedback>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    {assignError && (
                                                        <p style={{color: "red", fontSize: "10px"}}>
                                                            Teacher selection is required!
                                                        </p>
                                                    )}
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <br/>
                                                        <div className="text-end">
                                                            <button
                                                                type="submit"
                                                                className="btn btn-primary save-user"
                                                            >
                                                                Assign
                                                            </button>
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
        </React.Fragment>
    );
};

export default withAuth(ManageProgram);
