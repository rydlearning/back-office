import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { convertLessonTimes, convertTimeGroup, convertTimegroupToParentTimezone, formatData } from "../../utils";

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

const ManageProgram = () => {
    document.title = "Manage Promo Program | RYD Admin";

    const [programs, setPrograms] = useState([]);
    const [programsList, setProgramsList] = useState([]);
    const [modal, setModal] = useState(false);
    const [assignModal, setAssignModal] = useState(false);
    const [timeModal, setTimeModal] = useState(false);
    const [assignActionModal, setAssignActionModal] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [firstSelectedDay, setFirstSelectedDay] = useState("");
    const [LastSelectedDay, setLastSelectedDay] = useState("");
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [multiIDs, setMultiIDs] = useState([]);
    const [multiTargetIDs, setMultiTargetIDs] = useState({});
    const [programMData, setProgramMData] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [coupons, setCoupons] = useState([]);
    const [timeGroup, setTimeGroup] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [packages, setPackages] = useState([]);
    const [filteredProgramList0, setFilteredProgramList0] = useState([]);
    const [filteredProgramList2, setFilteredProgramList2] = useState([]);
    const [displayProgramList, setDisplayProgramList] = useState([]);
    const { id } = useParams()
    const [selectedTimeGroup, setSelectedTimeGroup] = useState('');
    const [selectedTimeGroupId, setSelectedTimeGroupId] = useState();
    const [selectedDates, setSelectedDates] = useState({});
    const [timeWATFilter, setTimeWATFilter] = useState('');
    const [dayFilter, setDayFilter] = useState('');
    const [selectAll, setSelectAll] = useState(false);


    const splitTimeSlots = (timeString) => {
        if (!timeString) return [];
        return timeString.includes(',') ?
            timeString.split(',').map(time => time.trim()) :
            [timeString.trim()];
    };

    const handleTimeGroupSelection = (timeValue) => {
        const data = formatData(timeValue)
        setSelectedTimeGroupId(data.value)
        setSelectedTimeGroup(data.name);
        setSelectedDates({});
    };

    // const formattedData = (date) => {
    //     return new Date(date).toLocaleDateString('en-US', {
    //         month: 'long',
    //         day: 'numeric'
    //     })
    // };

    const formattedData = (date) => {
        return moment.utc(date).format('MMMM D'); // Format as desired
    };


    useEffect(() => {
        fetchPrograms().then(r => null);
    }, [modal]);

    useEffect(() => {
        fetchTimeGroup(id)
    }, [id]);


    const handleAssignClick = (programData) => {
        setSelectedProgram(programData);
        setAssignModal(true)
    };
    const handleTimeClick = (programData) => {
        setMultiTargetIDs({})
        setTimeModal(true)
        setSelectedTimeGroup('')
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
    }, []);

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
            const response = await axios.get(`${baseUrl}/admin/promo/program/all/${id}`);
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

    const fetchTimeGroup = async (id) => {
        try {
            const response = await axios.get(`${baseUrl}/admin/promo/timegroup/${id}`);
            setTimeGroup(response.data.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleTeacherAssignClick = async () => {
        try {
            await axios.post(`${baseUrl}/admin/promo/program/assign/teacher`, {
                programIds: selectedProgram.id,
                teacherId: selectedTeacher
            });
            // Fetch the updated programs after successful assignment
            // await fetchPrograms(); // Assuming fetchPrograms function updates the programs state

            toast.success("Teacher assigned successfully.");
            setAssignModal(false);
            setMultiTargetIDs({})
            setSelectedTimeGroup('')
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to assign teacher.");
        }
    };

    const handleProgramClickSubmit = async () => {
        // if (!firstSelectedDay) {
        //     toast.error("Please, select a date")
        //     return;
        // }
        const newDay = firstSelectedDay ? firstSelectedDay + " & " + LastSelectedDay : null

        if (!selectedProgram || !selectedProgram?.id) {
            //console.error("Invalid program data.");
            toast.warn("Reload this page and try again")
            return;
        }
        //check and push to server
        await axios.put(`${baseUrl}/admin/promo/program/edit/${selectedProgram.id}`, { day: newDay, timeGroupIndex: selectedTimeGroupId });
        toast.success("Program data altered changes");
        setSelectedTimeGroup('')
        setFirstSelectedDay("")
        setLastSelectedDay("")
        setSelectedTimeGroupId(null)
        setModal(false)
        // await fetchPrograms()
    }

    const handleProgramClick = (programData) => {
        setFirstSelectedDay("")
        setLastSelectedDay("")
        setSelectedProgram(programData)
        const time = convertTimeGroup(timeGroup)
        if (time) {
            const select = time[programData.timeGroupIndex]?.name
            const selectID = time[programData.timeGroupIndex]?.value
            setSelectedTimeGroup(select)
            setSelectedTimeGroupId(selectID)
            setModal(true)
        }
    };

    const processBatchOperations = async (status) => {
        //performing group actions
        if (status && !firstSelectedDay) {
            toast.error("Please, select a date")
            return;
        }
        const newDay = firstSelectedDay + " & " + LastSelectedDay
        try {
            if (multiIDs.length > 0) {
                const data = status ? { ids: multiIDs, day: newDay } : { ids: multiIDs, ...multiTargetIDs }
                await axios.post(`${baseUrl}/admin/promo/program/batch-update`, data);
                toast.success("Program data altered changes");
                // await fetchPrograms()
                setMultiTargetIDs({})
                setAssignActionModal(false)
                setTimeModal(false)
                setSelectedTimeGroup('')
                setFirstSelectedDay("")
                setLastSelectedDay("")
                setSelectedTimeGroupId(null)
            } else {
                toast.error("Please, select at least 1 child/program to perform action")
            }
        } catch (e) {
            toast.error("Reload this page and try again")
        }
    }

    const processReminder = async () => {
        //performing group actions
        try {
            if (multiIDs.length > 0) {
                const response = await axios.post(`${baseUrl}/admin/promo/parent/send/reminder`, { ids: multiIDs });
                if (!response.data.status) {
                    toast.error(response.data.message);
                } else {
                    toast.success("Class reminder sent successfully");
                    // await fetchPrograms()
                }

            } else {
                toast.error("Please, select at least 1 child/program to perform action")
            }
        } catch (e) {
            toast.error("Reload this page and try again")
        }
    }

    const processCertificate = async () => {
        //performing group actions
        try {
            if (multiIDs.length > 0) {
                const response = await axios.post(`${baseUrl}/admin/promo/parent/certificate`, { id: multiIDs });
                if (!response.data.status) {
                    toast.error(response.data.message);
                } else {
                    toast.success("Certificate downloader email  sent successfully");
                    // await fetchPrograms()
                }

            } else {
                toast.error("Please, select at least 1 child/program to perform action")
            }
        } catch (e) {
            toast.error("Reload this page and try again")
        }
    }

    const processComplete = async (status) => {
        //performing group actions
        try {
            if (multiIDs.length > 0) {
                const response = await axios.post(`${baseUrl}/admin/promo/program/complete`, { ids: multiIDs, status });
                if (!response.data.status) {
                    toast.error(response.data.message);
                } else {
                    toast.success("Programs completed successfully");
                    // await fetchPrograms()
                }

            } else {
                toast.error("Please, select at least 1 child/program to perform action")
            }
        } catch (e) {
            toast.error("Reload this page and try again")
        }
    }

    const processSingleCertificate = async (id) => {
        //performing group actions
        try {
            if (id) {
                const response = await axios.post(`${baseUrl}/admin/promo/parent/single/certificate`, { id });
                if (!response.data.status) {
                    toast.error(response.data.message);
                } else {
                    toast.success("Certificate downloader email  sent successfully");
                    // await fetchPrograms()
                }

            } else {
                toast.error("Error, Try again later")
            }
        } catch (e) {
            toast.error("Reload this page and try again")
        }
    }

    const processSingleComplete = async (id,status) => {
        //performing group actions
        try {
            if (id) {
                const response = await axios.put(`${baseUrl}/admin/promo/program/complete/${id}`, { status });
                if (!response.data.status) {
                    toast.error(response.data.message);
                } else {
                    toast.success("Programs completed successfully");
                    // await fetchPrograms()
                }

            } else {
                toast.error("Error, Try again later")
            }
        } catch (e) {
            toast.error("Reload this page and try again")
        }
    }

    const procesSinglesReminder = async (id) => {
        //performing group actions
        try {
            if (id) {
                const response = await axios.post(`${baseUrl}/admin/promo/parent/send/single/reminder`, { id });
                if (!response.data.status) {
                    toast.error(response.data.message);
                } else {
                    toast.success("Class reminder sent successfully");
                    // await fetchPrograms()
                }
            }
        } catch (e) {
            toast.error("Reload this page and try again")
        }
    }

    const FormatDate = (data, i) => {
        const parsedTimeSlots = formatData(data);
        if (parsedTimeSlots[i]) {
            return parsedTimeSlots[i].map(({ dayText, timeText }) => `${dayText} ${timeText}`).join(' - ');
        }
        return '';
    };

    const parentTimeZone = (times, index, timezone) => {
        const parsedTimes = formatData(times)
        const timeGroup = parsedTimes[index];
        const time = convertLessonTimes(timeGroup, timezone)
        return time
    }

    function renderDate(data) {
        const parsedData = formatData(data);
        const formattedDates = parsedData.map(item => `${item.value}, ${item.name}`);
        return formattedDates.join(' & ');
    }

    const filteredPrograms = React.useMemo(() => {
        // First, filter the programs
        const filtered = displayProgramList.filter(program => {
            // Time (WAT) Filter
            // const matchTimeWAT = !timeWATFilter ||
            //     parentTimeZone(program.timeGroup.times, program?.timeGroupIndex, program?.child?.parent?.timezone)
            //         .toLowerCase().includes(timeWATFilter.toLowerCase());

            const matchTime = !timeWATFilter ||
                FormatDate(program.timeGroup.times, program.timeGroupIndex)
                    .toLowerCase().includes(timeWATFilter.toLowerCase());

            const matchDay = !dayFilter || (
                program?.day &&
                program?.child?.parent?.timezone && program.day
                    .toLowerCase()
                    .includes(dayFilter.toLowerCase())
            );

            return matchTime & matchDay
        });

        // Then, sort the filtered programs by WAT time
        return filtered.sort((a, b) => {
            const timeA = parentTimeZone(a.timeGroup.times, a?.timeGroupIndex, a?.child?.parent?.timezone);
            const timeB = parentTimeZone(b.timeGroup.times, b?.timeGroupIndex, b?.child?.parent?.timezone);

            const parseTime = (timeStr) => {
                const [time, period] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);

                // Adjust hours for 12-hour format
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;

                return hours * 60 + (minutes || 0);
            };

            return parseTime(timeA) - parseTime(timeB);
        });
    }, [displayProgramList, timeWATFilter, dayFilter]);


    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            // Select all items
            const allIDs = filteredPrograms.map(program => program.id);
            setMultiIDs(allIDs);
            toast.warn("All items have been added to the action list.");
        } else {
            setMultiIDs([])
            toast.error("All items have been removed from the action list.");
        }
    };

    const getStatusColor = (status) => {
        return status === true ? 'green' : 'gray';
    };


    return (
        <React.Fragment>
            <ToastContainer />
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Program" />
                    <Row>
                        <Col lg="12">
                            <Row className="align-items-center me-2">
                                <Col md={4}>
                                    <div className="mb-3">
                                        <h5 className="card-title">
                                            Manage Promo Program List {" "}
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
                                            <Input
                                                type="text"
                                                placeholder="Filter by Time "
                                                value={timeWATFilter}
                                                onChange={(e) => setTimeWATFilter(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="text"
                                                placeholder="Filter by Day"
                                                value={dayFilter}
                                                onChange={(e) => setDayFilter(e.target.value)}
                                            />
                                        </div>
                                        {/* <div>
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
                                        </div> */}

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
                                        <div style={{ marginRight: 10 }}>
                                            <button onClick={handleActionAssignClick} title="Assign Teacher">
                                                <i className="mdi mdi-clipboard-account font-size-20"></i>
                                            </button>
                                        </div>
                                        <div style={{ marginRight: 10 }}>
                                            <button onClick={handleTimeClick} title="Assign Date">
                                                <i className="mdi mdi-clock font-size-20"></i>
                                            </button>
                                        </div>
                                        <div style={{ marginRight: 10 }}>
                                            <button onClick={() => {
                                                if (confirm(`You're about to send a class reminder to ${multiIDs.length} parent, will you like to proceed ?`)) {
                                                    processReminder();
                                                }
                                            }}
                                                title="Class Reminder"
                                            >
                                                <i className="mdi mdi-bell font-size-20"></i>
                                            </button>
                                        </div>
                                        <div style={{ marginRight: 10 }}>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`You're about to send a certificate downloader email to ${multiIDs.length} parent that their child have completed this probono, will you like to proceed ?`)) {
                                                        processCertificate();
                                                    }
                                                }}
                                                title="Send certificate email to parents"
                                            >
                                                <i className="mdi mdi-mail font-size-20"></i>
                                            </button>
                                        </div>
                                        <div style={{ marginRight: 10 }}>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`You're about to complete ${multiIDs.length} children program, will you like to proceed ?`)) {
                                                        processComplete(true);
                                                    }
                                                }}
                                                title="Send certificate email to parents"
                                            >
                                                <i className="mdi mdi-check font-size-20"></i>
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
                                    ) : filteredPrograms.length === 0 ? (
                                        <div className="text-center mt-5">
                                            <h3>No data available</h3>
                                        </div>
                                    ) : (
                                        <table className="table align-middle table-hover">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <div style={{ width: 50 }} className={'align-middle'}>
                                                            <input
                                                                style={{ marginRight: 5 }}
                                                                type={'checkbox'}
                                                                onChange={e => handleSelectAllChange(e)}
                                                            />
                                                            All
                                                        </div>
                                                    </th>
                                                    <th>P.Name</th>
                                                    <th>C.Name</th>
                                                    <th>Phone</th>
                                                    <th>Email</th>
                                                    <th>Age</th>
                                                    <th>Gender</th>
                                                    <th>T.Name</th>
                                                    <th>T.Group</th>
                                                    <th>P.Time</th>
                                                    <th>Time(WAT)</th>
                                                    <th>Day</th>
                                                    <th>Status</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPrograms.map((program, index) => (
                                                    <tr key={index}
                                                        style={{ backgroundColor: (program.isPaid) ? '#f1fdf4' : '#fff' }}>
                                                        <td>
                                                            <div style={{ width: 50 }} className={'align-middle'}>
                                                                <input style={{ marginRight: 5 }} type={'checkbox'}
                                                                    onClick={(d) => {
                                                                        //multiple selection push to array
                                                                        if (multiIDs.includes(program.id)) {
                                                                            //remove from array
                                                                            setMultiIDs(multiIDs.filter(i => i !== program.id))
                                                                            toast.error(program?.child?.firstName + " removed is been from the action list.")
                                                                        } else {
                                                                            setMultiIDs([...multiIDs, program.id])
                                                                            toast.warn(program?.child?.firstName + " has been added to action list.")
                                                                        }
                                                                    }} checked={multiIDs.includes(program.id) || false} onChange={() => {
                                                                        //multiple selection push to array

                                                                    }} />
                                                                {index + 1}
                                                            </div>
                                                        </td>
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
                                                        <td>{program.timeGroup.title}</td>
                                                        <td>{parentTimeZone(program.timeGroup.times, program?.timeGroupIndex, program?.child?.parent?.timezone)}</td>
                                                        <td>{FormatDate(program.timeGroup.times, program.timeGroupIndex)}</td>
                                                        <td>{program?.day ? program?.day : "No date assigned"}</td>
                                                        <td> <span style={{ color: getStatusColor(program.isCompleted) }}>
                                                            {program.isCompleted === true ? 'Completed' : 'Ongoing'}
                                                        </span></td>
                                                        <td>
                                                            <span
                                                                className="text-danger"
                                                                style={{ cursor: 'pointer' }}
                                                                to="#"
                                                                id="edit"
                                                                title="Assign Date"
                                                                onClick={() => handleProgramClick(program)}>
                                                                <i className="mdi mdi-clock-outline font-size-12"></i>
                                                            </span>
                                                            <span
                                                                className="text-warning"
                                                                style={{ cursor: 'pointer' }}
                                                                to="#"
                                                                id="edit"
                                                                title="Reminder"
                                                                onClick={() => {
                                                                    if (confirm(`You're about to send a class reminder to this parent, will you like to proceed ?`)) {
                                                                        procesSinglesReminder(program.id)
                                                                    }
                                                                }}>
                                                                <i className="mdi mdi-bell font-size-12"></i>
                                                            </span>
                                                            <span
                                                                className="text-primary"
                                                                to="#"
                                                                style={{ cursor: 'pointer' }}
                                                                id="assign"
                                                                title="Assign Teacher"
                                                                onClick={() => handleAssignClick(program)}>
                                                                <i className="mdi mdi-clipboard-account font-size-12"></i>
                                                            </span>
                                                            <span
                                                                className="text-success"
                                                                to="#"
                                                                style={{ cursor: 'pointer' }}
                                                                id="assign"
                                                                title="Send certificate"
                                                                onClick={() => {
                                                                    if (confirm(`You're about to send a certificate downloader email to ${program?.child?.parent?.firstName + " " + program?.child?.parent?.lastName}, will you like to proceed ?`)) {
                                                                        processSingleCertificate(program.id);
                                                                    }
                                                                }}>
                                                                <i className="mdi mdi-mail font-size-12"></i>
                                                            </span>
                                                            <span
                                                                className="text-blue"
                                                                to="#"
                                                                style={{ cursor: 'pointer' }}
                                                                id="assign"
                                                                title="Complete program"
                                                                onClick={() => {
                                                                    if (confirm(`Are you sure you want to change the status of this child promo program, will you like to proceed ?`)) {
                                                                        processSingleComplete(program.id, program?.isCompleted ? false : true,);
                                                                    }
                                                                }}>
                                                                <i className="mdi mdi-check font-size-12"></i>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    <Modal isOpen={modal} toggle={() => setModal(!modal)}>
                                        <ModalHeader toggle={() => setModal(!modal)}>
                                            {"Assign Date "}
                                        </ModalHeader>
                                        <ModalBody>
                                            <Row>
                                                <small className={'text-danger mb-3'}>Warning: This action will
                                                    alter {multiIDs.length} children. confirm again !</small>
                                                <Col xs={12}>
                                                    <div className="col-md-12">
                                                        <div className="mb-6">
                                                            <select
                                                                className={'form-control'}
                                                                value={selectedTimeGroup}
                                                                onChange={(e) => handleTimeGroupSelection(e.target.value)}
                                                            >
                                                                <option value="">{selectedTimeGroup ? selectedTimeGroup : "Select Time Group"}</option>
                                                                {convertTimeGroup(timeGroup)?.length > 0 &&
                                                                    convertTimeGroup(timeGroup)?.map((time) => (
                                                                        <option key={time?.value}
                                                                            value={JSON.stringify(time)}>
                                                                            {time.name}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-6 mt-3">
                                                            <div className="font-medium min-w-[120px]">First day</div>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                onChange={(e) => setFirstSelectedDay(formattedData(e.target.value))}
                                                            />
                                                            {firstSelectedDay && (
                                                                <div className="text-sm text-gray-600">
                                                                    {firstSelectedDay}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="col-md-6 mt-3">
                                                            <div className="font-medium min-w-[120px]">Second day</div>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                onChange={(e) => setLastSelectedDay(formattedData(e.target.value))}
                                                            />
                                                            {LastSelectedDay && (
                                                                <div className="text-sm text-gray-600">
                                                                    {LastSelectedDay}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <div className="text-end mt-4">
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
                                                            <div className="col-md-12 mb-3">
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

                                    <Modal isOpen={timeModal} toggle={() => setTimeModal(!timeModal)}>
                                        <ModalHeader toggle={() => setTimeModal(!timeModal)}> Assign Date (Group Action)
                                        </ModalHeader>
                                        <ModalBody>
                                            <Row>
                                                <small className={'text-danger mb-3'}>Warning: This action will
                                                    alter {multiIDs.length} children. confirm again !</small>
                                                <Col xs={12}>
                                                    <div className="row">
                                                        <div className="col-md-6 mt-3">
                                                            <div className="font-medium min-w-[120px]">First day</div>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                onChange={(e) => setFirstSelectedDay(formattedData(e.target.value))}
                                                            />
                                                            {firstSelectedDay && (
                                                                <div className="text-sm text-gray-600">
                                                                    {firstSelectedDay}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="col-md-6 mt-3">
                                                            <div className="font-medium min-w-[120px]">Second day</div>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                onChange={(e) => setLastSelectedDay(formattedData(e.target.value))}
                                                            />
                                                            {LastSelectedDay && (
                                                                <div className="text-sm text-gray-600">
                                                                    {LastSelectedDay}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <br />
                                                    <div className="text-end">
                                                        <button
                                                            onClick={() => processBatchOperations(true)}
                                                            className="btn btn-primary save-user">
                                                            Update
                                                        </button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </ModalBody>
                                    </Modal>

                                    <Modal isOpen={assignActionModal}
                                        toggle={() => setAssignActionModal(!assignActionModal)}>
                                        <ModalHeader toggle={() => setAssignActionModal(!assignActionModal)}>
                                            Assign Teacher (Group Action)</ModalHeader>
                                        <ModalBody>
                                            <Row>
                                                <small className={'text-danger mb-3'}>Warning: This action will
                                                    alter {multiIDs.length} children. confirm again !</small>
                                                <Col xs={12}>
                                                    <div className="row">
                                                        <div className="col-md-12 mb-3">
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
                                                            onClick={() => processBatchOperations(false)}
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

export default withAuth(ManageProgram);
