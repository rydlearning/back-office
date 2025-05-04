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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


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

const ManageTeacherView = () => {
    document.title = "Manage Program | RYD Admin";

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
    const [packages, setPackages] = useState([]);
    const [filteredProgramList0, setFilteredProgramList0] = useState([]);
    const [filteredProgramList2, setFilteredProgramList2] = useState([]);
    const [displayProgramList, setDisplayProgramList] = useState([]);

    useEffect(() => {
        fetchPrograms().then(r => null);
    }, [modal]);


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
            const response = await axios.get(`${baseUrl}/admin/program/all`);
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

    const fetchTeachers = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/teacher/all`);
            setTeachers(response.data.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };


    const handleToggleIsPaid = async (programData) => {
        try {
            if (!programData || !programData.id) {
                //console.error("Invalid program data.");
                return;
            }
            const updatedProgram = { ...programData, isPaid: !programData.isPaid };
            await axios.put(
                `${baseUrl}/admin/program/edit/${programData.id}`,
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
                await fetchPrograms();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const getStatusColor = (status) => {
        return status === 1 ? 'green' : 'gray';
    };

    const convertSingleLessonTimesProgram = (time, timezone, day) => {
        if (!time || !timezone || day === undefined) return '';

        // Get the time in format "HH:MMAM/PM" (e.g., "8:00AM")
        const timeStr = formatTime(time);

        try {
            // Parse the time string into hours and minutes
            const [timePart, period] = timeStr.match(/(\d+):(\d+)([AP]M)/).slice(1);
            let hours = parseInt(timePart, 10);
            const minutes = parseInt(period, 10);

            // Convert to 24-hour format
            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }

            // Create a moment object in the program's timezone (UTC)
            const programTime = moment().utc()
                .day(day)
                .hour(hours)
                .minute(minutes)
                .second(0);

            // Convert to parent's timezone
            const parentTime = programTime.clone().tz(timezone);

            // Format the time in 12-hour format with AM/PM
            return parentTime.format('h:mmA');

        } catch (error) {
            console.error('Error converting lesson time:', error);
            return timeStr; // Return original time if conversion fails
        }
    };

    const exportToExcel = () => {
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';

        const dataToExport = displayProgramList.map(program => ({
            'Parent Name': `${program?.child?.parent?.firstName} ${program?.child?.parent?.lastName}`,
            'Child Name': `${program?.child?.firstName} ${program?.child?.lastName}`,
            'Country': program?.child?.parent?.country,
            'Phone': program?.child?.parent?.phone,
            'Email': program?.child?.parent?.email,
            'Age': program?.child?.age,
            'Gender': program?.child?.gender,
            'Teacher': program?.teacher?.firstName,
            'Package': program?.package?.title,
            'Cohort': program?.cohort?.title || "No Cohort",
            'Level': program?.package?.level,
            'Time': formatTime(program.time),
            'Local Time': convertSingleLessonTimesProgram(formatTime(program.time), program?.child?.parent?.timezone, formatDay(program.day)),
            'Day': formatDay(program.day),
            'Curriculum': program?.child?.curriculum === 1 ? 'New' : 'Old',
            'Status': program.isPaid ? 'Paid' : 'Unpaid',
            'Coupon': program?.coupon?.code || '',
            'Date Created': moment(program?.createdAt).format('DD-MM-YY')
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        saveAs(data, `programs_export_${new Date().getTime()}` + fileExtension);
    };

    return (
        <React.Fragment>
            <ToastContainer />
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Techer View" />
                    <Row>
                        <Col lg="12">
                            <Row className="align-items-center me-2">
                                <Col md={4}>
                                    <div className="mb-3">
                                        <h5 className="card-title">
                                            Manage Techer View{" "}
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
                                                } else {
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
                                        <div>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`You're about to export the programs data, wanna proceed ?`)) {
                                                        exportToExcel();
                                                    }
                                                }}
                                                title="Export to Excel"
                                            >
                                                <i className="mdi mdi-file-excel font-size-20"></i>
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
                                                    <th>C.Name</th>
                                                    <th>Age</th>
                                                    <th>Gender</th>
                                                    <th>T.Name</th>
                                                    <th>P.Title</th>
                                                    <th>Level</th>
                                                    <th>Time</th>
                                                    <th>(WAT)</th>
                                                    <th>Day</th>
                                                    <th>Curriculum</th>
                                                    <th>Status</th>
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
                                                                            toast.error(program?.child?.firstName + " removed is been from the action list.")
                                                                        } else {
                                                                            setMultiIDs([...multiIDs, program.id])
                                                                            toast.warn(program?.child?.firstName + " has been added to action list.")
                                                                        }
                                                                    }} />
                                                                {index + 1}
                                                            </div>
                                                        </td>
                                                        <td>{program?.child?.firstName + " " + program?.child?.lastName}
                                                            <br />
                                                            [{program?.child?.parent?.country}]
                                                        </td>
                                                        <td>{program?.child?.age}</td>
                                                        <td>{program?.child?.gender}</td>
                                                        <td>{program?.teacher?.firstName}</td>
                                                        <td>{program?.package?.title}<br /><small
                                                            style={{ color: 'red' }}>[{program?.cohort?.title || "No Cohort"}]</small>
                                                        </td>
                                                        {/*<td>*/}
                                                        {/*  {program?.package?.status ? "Active" : "Inactive"}*/}
                                                        {/*</td>*/}
                                                        <td>{program?.package?.level}</td>
                                                        <td>{formatTime(program.time)}</td>
                                                        <td><td>{convertSingleLessonTimesProgram(formatTime(program.time), program?.child?.parent?.timezone, formatDay(program.day))}</td></td>
                                                        <td>{formatDay(program.day)}</td>
                                                        <td> <span style={{ color: getStatusColor(program.curriculum) }}>
                                                            {program.curriculum === 1 ? 'New' : 'Old'}
                                                        </span>
                                                        </td>
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
                                                                <small style={{ fontSize: 10, backgroundColor: "#e3e3e3", padding: 2, display: program?.coupon?.code ? "block" : "none" }}>{program?.coupon?.code}</small>
                                                                <small style={{ fontSize: 10 }}><Moment format={'DD-MM-YY'} date={program?.createdAt} /></small>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default withAuth(ManageTeacherView);
