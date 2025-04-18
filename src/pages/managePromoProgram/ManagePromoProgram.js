import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from "axios";
import { Col, Container, Form, Input, Label, Modal, ModalBody, ModalHeader, Row, } from "reactstrap";
import withAuth from "../withAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from '../../Network';
import Moment from 'react-moment';
import moment from 'moment-timezone';
import 'moment-timezone';

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

const formatTimeZone = (tz, day, time) => {
    const pTime = moment().utc(false).utcOffset(tz)
    pTime.day(day)
    pTime.hour(time)
    pTime.second(0)
    pTime.minute(0)
    return pTime
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const formatDay = (day) => {
    // Adjust day to be within the range of 0 to 6
    //const adjustedDay = (((day - 1) % 7) + 7) % 7;
    return days[day];
};

const ManagePartnerProgram = () => {
    document.title = "Manage Partner Programs | RYD Admin";

    const [programs, setPrograms] = useState([]);
    const [programsList, setProgramsList] = useState([]);
    const [modal, setModal] = useState(false);
    const [assignModal, setAssignModal] = useState(false);
    const [assignActionModal, setAssignActionModal] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [multiIDs, setMultiIDs] = useState([]);
    const [multiTargetIDs, setMultiTargetIDs] = useState({});
    const [programMData, setProgramMData] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [coupons, setCoupons] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [adhoc, setAdhoc] = useState();
    const [packages, setPackages] = useState([]);
    const [filteredProgramList0, setFilteredProgramList0] = useState([]);
    const [filteredProgramList2, setFilteredProgramList2] = useState([]);
    const [displayProgramList, setDisplayProgramList] = useState([]);

    useEffect(() => {
        fetchPrograms().then(r => null);
    }, [modal]);


    const handleAssignClick = (programData) => {
        setSelectedProgram(programData);
        setAssignModal(true)
    };

    const handleActionAssignClick = (programData) => {
        setMultiTargetIDs({})
        setAssignActionModal(true)
    };

    const handleTeacherChange = (e) => {
        setSelectedTeacher(e.target.value);
    };

    useEffect(() => {
        fetchPrograms().then(r => null)
    }, [modal]);

    useEffect(() => {
        fetchTeachers().then(r => null)
        //fetch coupon
        fetchCoupons().then(r => null)
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/coupon/all`);
            setCoupons(response.data.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    function compareFn(a, b) {
        if (a.time < b.time && a.day < b.day) {
            return -1;
        } else if (a.time > b.time && a.day > b.day) {
            return 1;
        }
        // a must be equal to b
        return 0;
    }

    const fetchPrograms = async () => {
        try {
            const packages = await axios.get(`${baseUrl}/admin/package/all`);
            const cohorts = await axios.get(`${baseUrl}/admin/cohort/all`);
            const response = await axios.get(`${baseUrl}/admin/promo/program/all`);
            setPrograms(response?.data?.data);
            setCohorts(cohorts?.data?.data);
            setPackages(packages?.data?.data)
            setLoading(false);
            setTimeout(() => {
                //filter to it
                const xdata = response?.data?.data;
                //setProgramsList(xdata.sort(compareFn))
                const __xdata = xdata.sort(compareFn)

                setProgramsList(__xdata)
                setDisplayProgramList(__xdata)
                setFilteredProgramList0(__xdata)
                setFilteredProgramList2(__xdata)
                setLoading(false); // Update loading state after data fetch
            }, 100)
        } catch (error) {
            setLoading(false);
            //console.error("Error:", error);
        }
    };

    useEffect(() => {
        const org = [...new Set(programs.map(item => item.promo.title))];
        setAdhoc(org)
    }, [programs])

    const fetchTeachers = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/teacher/all`);
            setTeachers(response.data.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleTeacherAssignClick = async () => {
        toast.warn("Processing.....");
        try {
            await axios.post(`${baseUrl}/admin/promo/program/assign/teacher`, {
                programIds: selectedProgram.id,
                teacherId: selectedTeacher
            });
            // Fetch the updated programs after successful assignment
            // await fetchPrograms(); // Assuming fetchPrograms function updates the programs state

            toast.success("Teacher assigned successfully.");
            setAssignModal(false);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to assign teacher.");
        }
    };

    const handleProgramClickSubmit = async () => {
        toast.warn("Processing.....");
        if (!selectedProgram || !selectedProgram?.id) {
            //console.error("Invalid program data.");
            toast.warn("Reload this page and try again")
            return;
        }
        //if nothing was picked
        if (Object.keys(programMData).length < 1) {
            toast.dark("No changes were made...")
            return;
        }
        //check and push to server
        await axios.put(`${baseUrl}/admin/promo/program/edit/${selectedProgram.id}`, programMData);
        toast.success("Program data altered changes");
        // await fetchPrograms()
    }

    const handleToggleIsPaid = async (programData) => {
        try {
            toast.warn("Processing.....");
            if (!programData || !programData.id) {
                //console.error("Invalid program data.");
                return;
            }
            const updatedProgram = { ...programData, isPaid: !programData.isPaid };
            await axios.put(
                `${baseUrl}/admin/promo/program/edit/${programData.id}`,
                updatedProgram
            );

            const confirmMarkAsPaid = window.confirm(
                "Are you sure you want to toggle this program payment status ?"
            );
            if (confirmMarkAsPaid) {
                const updatedPrograms = programs.map((program) =>
                    program.id === programData.id ? updatedProgram : program
                );
                setPrograms(updatedPrograms);
                toast.success("Program marked as paid.");
                // await fetchPrograms();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleProgramClick = (programData) => {
        // Pass program data to toggle for editing
        setSelectedProgram(programData)
        setModal(true)
    };

    const processBatchOperations = async () => {
        //performing group actions
        try {
            toast.warn("Processing.....");
            if (multiIDs.length > 0 && Object.keys(multiTargetIDs).length > 0) {
                await axios.post(`${baseUrl}/admin/promo/program/batch-update`, { ids: multiIDs, ...multiTargetIDs });
                toast.success("Program data altered changes");
                // await fetchPrograms()
            } else {
                toast.error("Please, select at least 1 child/program to perform action")
            }
        } catch (e) {
            toast.error("Reload this page and try again")
        }
    }

    const FormatDate = (data, i) => {
        const parsedTimeSlots = JSON.parse(data);
        if (parsedTimeSlots[i]) {
            return parsedTimeSlots[i].map(({ dayText, timeText }) => `${dayText} ${timeText}`).join(' - ');
        }
        return ''; 
    };
    

    return (
        <React.Fragment>
            <ToastContainer />
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Manage All Partners Program" />
                    <Row>
                        <Col lg="12">
                            <Row className="align-items-center me-2">
                                <Col md={4}>
                                    <div className="mb-3">
                                        <h5 className="card-title">
                                            All Adhoc Program List {" "}
                                            <span className="text-muted fw-normal ms-2">({displayProgramList.length})</span>
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
                                                    const searchProgrammed = programs.filter((program) => `${program?.child?.firstName} ${program?.child?.lastName} ${program?.child?.parent?.firstName} ${program?.child?.parent?.lastName}`.toLowerCase().includes(e.target.value.toLowerCase()));
                                                    setDisplayProgramList(searchProgrammed)
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <select className={'form-control'} onChange={(e) => {
                                                //filter based on cohorts
                                                if (Number(e.target.value) === 0) {
                                                    window.location.reload()
                                                } else {
                                                    const __cohortFilter = programs.filter(r => Number(r.cohortId) === Number(e.target.value));
                                                    setDisplayProgramList(__cohortFilter)
                                                    setFilteredProgramList0(__cohortFilter)
                                                    setFilteredProgramList2(__cohortFilter)
                                                }
                                            }}>
                                                <option value={0}>All Cohorts</option>
                                                {cohorts && cohorts.map((d, i) => <option key={i}
                                                    value={d.id}>{d.title}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <select className={'form-control'} onChange={(e) => {
                                                //filter based on cohorts
                                                if (Number(e.target.value) === 0) {
                                                    window.location.reload()
                                                } else {
                                                    const __cohortFilter = programs.filter(r => r.promo.title === e.target.value);
                                                    setDisplayProgramList(__cohortFilter)
                                                    setFilteredProgramList0(__cohortFilter)
                                                    setFilteredProgramList2(__cohortFilter)
                                                }
                                            }}>
                                                <option value={0}>All Adhoc</option>
                                                {adhoc && adhoc.map((o, i) => <option key={i}
                                                    value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <select className={'form-control'} onChange={(e) => {
                                                //filter based on status
                                                if (Number(e.target.value) === 1) {
                                                    const __activeProgramFilter = filteredProgramList0.filter(r => r.isPaid === true && r.isCompleted === false)
                                                    setDisplayProgramList(__activeProgramFilter)
                                                    setFilteredProgramList2(__activeProgramFilter)
                                                } else if (Number(e.target.value) === 2) {
                                                    setDisplayProgramList(filteredProgramList0.filter(r => r.isPaid === false && r.isCompleted === false))
                                                } else {
                                                    window.location.reload()
                                                }
                                            }}>
                                                <option value={0}>All Programs</option>
                                                <option value={1}>Active Enrolment</option>
                                                <option value={2}>Awaiting Checkout</option>
                                            </select>
                                        </div>
                                        <div>
                                            <select style={{ width: 150 }} className={'form-control'} onChange={(e) => {
                                                //filter based on coupon
                                                const packageID = Number(e.target.value)
                                                if (Number(packageID) === 0) {
                                                    //reload to fetch new data
                                                    window.location.reload()
                                                } else {
                                                    //filter with coupon code
                                                    setDisplayProgramList(filteredProgramList2.filter((p) => p?.package?.id === packageID))
                                                }
                                            }}>
                                                <option value={0}>All Packages</option>
                                                {packages.map((p, i) => <option key={i}
                                                    value={p.id}>{p.title}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <select style={{ width: 150 }} className={'form-control'} onChange={(e) => {
                                                //filter based on coupon
                                                const couponID = Number(e.target.value)
                                                if (Number(couponID) === 0) {
                                                    //reload to fetch new data
                                                    window.location.reload()
                                                } else {
                                                    //filter with coupon code
                                                    setDisplayProgramList(filteredProgramList2.filter((p) => p?.coupon?.id === couponID))
                                                }
                                            }}>
                                                <option value={0}>All Coupon</option>
                                                {coupons.map((c, i) => <option key={i}
                                                    value={c.id}>{c.code} [{c.value}]</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <select className={'form-control'} onChange={(e) => {
                                                //filter based on status
                                                if (Number(e.target.value) === 1) {
                                                    const __activeProgramFilter = filteredProgramList2.filter(r => r.teacherId !== null)
                                                    setDisplayProgramList(__activeProgramFilter)

                                                } else if (Number(e.target.value) === 2) {
                                                    const __activeProgramFilter = filteredProgramList2.filter(r => r.teacherId === null)
                                                    setDisplayProgramList(__activeProgramFilter)
                                                } else {
                                                    window.location.reload()
                                                }
                                            }}>
                                                <option value={0}>All Filter(s)</option>
                                                <option value={1}>With Teacher</option>
                                                <option value={2}>With No Teacher</option>
                                            </select>
                                        </div>
                                               <div>
                                            <select className={'form-control'} onChange={(e) => {
                                                //filter based on status
                                                if (Number(e.target.value) !== 0) {
                                                    const __activeProgramFilter = filteredProgramList2.filter(r => r.teacherId === Number(e.target.value))
                                                    setDisplayProgramList(__activeProgramFilter)
                                                }  else {
                                                    window.location.reload()
                                                }
                                            }}>
                                                <option value={0}>Filter by Teacher(s)</option>
                                                {teachers?.length > 0 &&
                                                    teachers?.map((teacher) => (
                                                        <option key={teacher?.id}
                                                            value={teacher?.id}>
                                                            {teacher.firstName} {teacher.lastName}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div style={{ marginRight: 20 }}>
                                            <button onClick={handleActionAssignClick}>
                                                <i className="mdi mdi-run-fast font-size-20"></i>
                                                <span className={'m-2'}></span>
                                                <i className="mdi mdi-clipboard-account font-size-20"></i>
                                            </button>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col xl="12" style={{ overflow: 'scroll', width: '98%' }}>
                                    {loading ? (
                                        <div className="text-center mt-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : displayProgramList.length === 0 ? (
                                        <div className="text-center mt-5">
                                            <h3>No data available</h3>
                                        </div>
                                    ) : (
                                        <table className="table align-middle table-hover">
                                            <thead>
                                                <tr>
                                                    <th>#{multiIDs.length || ""}</th>
                                                    <th>Adhoc</th>
                                                    <th>P.Name</th>
                                                    <th>C.Name</th>
                                                    <th>Phone</th>
                                                    <th>Email</th>
                                                    <th>Age</th>
                                                    <th>Gender</th>
                                                    <th>T.Name</th>
                                                    <th>P.Title</th>
                                                    <th>Level</th>
                                                    <th>T.Group</th>
                                                    <th>(WAT)</th>
                                                    <th>Duration</th>
                                                    <th>Status</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayProgramList.map((program, index) => (
                                                    <tr key={index}
                                                        style={{ backgroundColor: (program.isPaid) ? '#f1fdf4' : '#fff' }}>
                                                        <td>
                                                            <div style={{ width: 50 }} className={'align-middle'}>
                                                                <input style={{ marginRight: 5 }} type={'checkbox'}
                                                                    onChange={(d) => {
                                                                        //multiple selection push to array
                                                                        if (multiIDs.includes(program.id)) {
                                                                            //remove from array
                                                                            setMultiIDs(multiIDs.filter(i => i !== program.id))
                                                                            toast.error(program?.promo?.title + " have been removed from the action list.")
                                                                        } else {
                                                                            setMultiIDs([...multiIDs, program.id])
                                                                            toast.warn(program?.promo?.title + " has been added to action list.")
                                                                        }
                                                                    }} />
                                                                {index + 1}
                                                            </div>
                                                        </td>
                                                        <td>{program?.promo?.title}</td>
                                                        <td>{program?.child?.parent?.firstName + " " + program?.child?.parent?.lastName}</td>
                                                        <td>{program?.child?.firstName + " " + program?.child?.lastName}
                                                            <br />
                                                            [{program?.child?.parent?.country}]
                                                        </td>
                                                        <td>{program?.child?.parent?.phone}</td>
                                                        <td>{program?.child?.parent?.email}</td>
                                                        <td>{program?.child?.age}</td>
                                                        <td>{program?.child?.gender}</td>
                                                        <td>{program?.promo_teacher?.firstName}</td>
                                                        <td>{program?.promo_package?.title}<br /><small
                                                            style={{ color: 'red' }}>[{program?.promo_cohort?.title || "No Cohort"}]</small>
                                                        </td>
                                                        {/*<td>*/}
                                                        {/*  {program?.package?.status ? "Active" : "Inactive"}*/}
                                                        {/*</td>*/}
                                                        <td>{program?.promo_package?.level}</td>
                                                        <td>{program.timeGroup.title}</td>
                                                        <td><Moment format='hh:mm A'
                                                            date={formatTimeZone(program?.child?.parent?.timeOffset, program.day, program.time).toISOString()}
                                                            tz={"Africa/Lagos"}></Moment></td>
                                                        <td>{FormatDate(program.timeGroup.times, program.timeGroupIndex)}</td>
                                                        <td>
                                                            <div style={{ width: 50 }}>
                                                                {program.isPaid ? (
                                                                    <a rel={'noreferrer'}
                                                                        href={'#' + program.trxId}
                                                                        onClick={(e) => {
                                                                            e.preventDefault()
                                                                            handleToggleIsPaid(program).then(r => null)
                                                                        }}
                                                                    >Paid</a>
                                                                ) : (
                                                                    <a rel={'noreferrer'} href={'#'} onClick={(e) => {
                                                                        e.preventDefault()
                                                                        handleToggleIsPaid(program).then(r => null)
                                                                    }}
                                                                        disabled={program.isPaid}>
                                                                        Unpaid
                                                                    </a>
                                                                )}
                                                                {!program.isPaid && (
                                                                    <Link
                                                                        className="ms-1 text-primary"
                                                                        to="#"
                                                                        onClick={(e) => e.preventDefault()}
                                                                    ></Link>
                                                                )}
                                                                <br />
                                                                <small style={{ fontSize: 10, backgroundColor: "#e3e3e3", padding: 2, display: program?.promo_coupon?.code ? "block" : "none" }}>{program?.promo_coupon?.code}</small>
                                                                <small style={{ fontSize: 10 }}><Moment format={'DD-MM-YY'} date={program?.createdAt} /></small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Link
                                                                className="text-danger"
                                                                to="#"
                                                                id="edit"
                                                                onClick={() => handleProgramClick(program)}>
                                                                <i className="mdi mdi-clock-outline font-size-12"></i>
                                                            </Link>

                                                            <Link
                                                                className="text-primary"
                                                                to="#"
                                                                id="assign"
                                                                onClick={() => handleAssignClick(program)}>
                                                                <i className="mdi mdi-clipboard-account font-size-12"></i>
                                                            </Link>

                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    <Modal isOpen={modal} toggle={() => setModal(!modal)}>
                                        <ModalHeader toggle={() => setModal(!modal)}>
                                            {"Modify Program Data"}
                                        </ModalHeader>
                                        <ModalBody>
                                            <Row>
                                                <small className={'mb-2 text-danger'}>Warning: Check and be sure of
                                                    parent timezone offset before any changes</small>
                                                <Col xs={12}>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <Label>Cohort</Label>
                                                                <select className={'form-control'}
                                                                    onChange={e => setProgramMData({
                                                                        ...programMData,
                                                                        cohortId: e.target.value
                                                                    })}>
                                                                    <option value="">Select Cohort</option>
                                                                    {cohorts && cohorts.map((d, i) => <option
                                                                        key={i} value={d.id}>{d.title}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <Label>Packages</Label>
                                                                <select className={'form-control'}
                                                                    onChange={e => setProgramMData({
                                                                        ...programMData,
                                                                        packageId: e.target.value
                                                                    })}>
                                                                    <option value="">Select Package</option>
                                                                    {packages && packages.map((d, i) => <option
                                                                        key={i} value={d.id}>{d.title}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <Label>Level</Label>
                                                                <select className={'form-control'}
                                                                    onChange={e => setProgramMData({
                                                                        ...programMData,
                                                                        level: e.target.value
                                                                    })}>
                                                                    <option value="">Select Level</option>
                                                                    <option value="4">4</option>
                                                                    <option value="3">3</option>
                                                                    <option value="2">2</option>
                                                                    <option value="1">1</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <Label>Day</Label>
                                                                <select className={'form-control'}
                                                                    onChange={e => setProgramMData({
                                                                        ...programMData,
                                                                        day: e.target.value
                                                                    })}>
                                                                    <option value="">Select Day</option>
                                                                    {days.map((d, i) => <option
                                                                        key={i} value={i}>{d}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <Label>Time</Label>
                                                                <select className={'form-control'}
                                                                    onChange={e => setProgramMData({
                                                                        ...programMData,
                                                                        time: e.target.value
                                                                    })}>
                                                                    <option value="">Select Time</option>
                                                                    {TIMES_.map((d, i) => <option
                                                                        key={i} value={i}>{d}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <div className="text-end">
                                                        <button
                                                            onClick={handleProgramClickSubmit}
                                                            className="btn btn-primary save-user">
                                                            Update Program Data
                                                        </button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </ModalBody>
                                    </Modal>

                                    <Modal isOpen={assignModal} toggle={() => setAssignModal(!assignModal)}>
                                        <ModalHeader toggle={() => setAssignModal(!assignModal)}>Assign
                                            Teacher</ModalHeader>
                                        <ModalBody>
                                            <Form onSubmit={(e) => {
                                                e.preventDefault();
                                                handleTeacherAssignClick().then(r => null);
                                            }}>
                                                <Row>
                                                    <Col xs={12}>
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div className="mb-6">
                                                                    <Input
                                                                        name="teacherId"
                                                                        type="select"
                                                                        onChange={handleTeacherChange}>
                                                                        <option value="">Select teacher</option>
                                                                        {teachers?.length > 0 &&
                                                                            teachers?.map((teacher) => (
                                                                                <option key={teacher?.id}
                                                                                    value={teacher?.id}>
                                                                                    {teacher.firstName} {teacher.lastName}
                                                                                </option>
                                                                            ))}
                                                                    </Input>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <br />
                                                        <div className="text-end">
                                                            <button
                                                                type="submit"
                                                                className="btn btn-primary save-user">
                                                                Assign New Teacher
                                                            </button>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </ModalBody>
                                    </Modal>

                                    <Modal isOpen={assignActionModal}
                                        toggle={() => setAssignActionModal(!assignActionModal)}>
                                        <ModalHeader toggle={() => setAssignActionModal(!assignActionModal)}>
                                            Perform Group Action</ModalHeader>
                                        <ModalBody>
                                            <Row>
                                                <small className={'text-danger mb-3'}>Warning: This action will
                                                    alter {multiIDs.length} children. confirm again !</small>
                                                <Col xs={12}>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="mb-6">
                                                                <select
                                                                    className={'form-control'}
                                                                    onChange={e => setMultiTargetIDs({
                                                                        ...multiTargetIDs,
                                                                        cohortId: e.target.value
                                                                    })}>
                                                                    <option value="">Select Cohort</option>
                                                                    {cohorts?.length > 0 &&
                                                                        cohorts?.map((c, i) => (
                                                                            <option key={i}
                                                                                value={c.id}>
                                                                                {c.title}
                                                                            </option>
                                                                        ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="mb-6">
                                                                <select
                                                                    className={'form-control'}
                                                                    onChange={e => setMultiTargetIDs({
                                                                        ...multiTargetIDs,
                                                                        teacherId: e.target.value
                                                                    })}>
                                                                    <option value="">Select Teacher</option>
                                                                    {teachers?.length > 0 &&
                                                                        teachers?.map((teacher) => (
                                                                            <option key={teacher?.id}
                                                                                value={teacher?.id}>
                                                                                {teacher.firstName} {teacher.lastName}
                                                                            </option>
                                                                        ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <br />
                                                    <div className="text-end">
                                                        <button
                                                            onClick={processBatchOperations}
                                                            type="submit"
                                                            className="btn btn-primary save-user">
                                                            Process Batch Data
                                                        </button>
                                                    </div>
                                                </Col>
                                            </Row>
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

export default withAuth(ManagePartnerProgram);
