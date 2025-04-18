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
  FormGroup,
  Badge,
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UploadImage, slugify } from "../../utils";
import Editor from 'react-simple-wysiwyg';


const ManageBlog = () => {
  document.title = "Manage Blog | RYD Admin";

  const [loading, setLoading] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState({});
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    'All',
    'News',
    'Technology',
    'Education',
    'Python',
    'Web Development',
    'Kids & Learning',
  ];

  // Status enum
  const statusOptions = ['draft', 'published', 'archived'];

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: blog.title || "",
      content: blog.content || "",
      category: blog.category || "",
      readTime: blog.readTime || "",
      featuredImage: blog.featuredImage || ""
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Please Enter Blog Title"),
      category: Yup.string().required("Please Enter Blog Category"),
      readTime: Yup.number().required("Please Enter Read Time"),
      featuredImage: Yup.mixed().required("Please Upload a Featured Image")
    }),
    onSubmit: async (values) => {
      setClicked(true);
  
      // // Validate content word count
      // const wordCount = values.content.split(/\s+/).length;
      // if (wordCount < 150) {
      //   toast.error("Content must have at least 150 words");
      //   setClicked(false);
      //   return;
      // }
  
      // // Extract first 100 words as excerpt
      // const excerpt = values.content.split(/\s+/).slice(0, 50).join(" ");
  
      try {
        const imageUrl = await UploadImage(values.featuredImage);
  
        if (imageUrl) {
          const newBlog = {
            title: values.title,
            slug: slugify(values.title),
            content: content,
            // excerpt: excerpt+".....",  
            category: values.category,
            readTime: values.readTime,
            featuredImage: imageUrl
          };
  
          let response;
          if (isEdit) {
            response = await axios.put(`${baseUrl}/admin/blog/${blog.id}`, newBlog);
            toast.success("Blog updated successfully");
          } else {
            response = await axios.post(`${baseUrl}/admin/blogs`, newBlog);
            toast.success("Blog created successfully");
          }
  
          // const responseData = response.data;
  
          // if (isEdit) {
          //   const updatedBlogs = blogs.map((b) => b.id === blog.id ? { ...b, ...responseData } : b);
          //   setBlogs(updatedBlogs);
          // } else {
          //   setBlogs([...blogs, responseData]);
          // }
  
          toggle();
          window.location.reload()
          setClicked(false);
        } else {
          toast.error("Try again later");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.message || "An error occurred");
      }
    }
  });
  

  useEffect(() => {
    fetchBlogs();
  }, [modal]);

  const fetchBlogs = async () => {
    try {
      const blogsResponse = await axios.get(`${baseUrl}/admin/blogs/all`);
      setBlogs(blogsResponse.data.data.blogs);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggle = () => {
    setModal(!modal);
  };

  const handleBlogClick = (blogData) => {
    setBlog(blogData);
    setIsEdit(true);
    toggle();
  };

  const onClickDelete = (blogData) => {
    setBlog(blogData);
    setDeleteModal(true);
  };

  const handleDeleteBlog = async () => {
    try {
      await axios.delete(`${baseUrl}/admin/blog/${blog.id}`);
      const updatedBlogs = blogs.filter((b) => b.id !== blog.id);
      setBlogs(updatedBlogs);
      setDeleteModal(false);
      toast.success("Blog deleted successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete blog");
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredBlogs = blogs?.filter((blog) =>
    blog?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to update blog status
  const updateBlogStatus = async (blogId, newStatus) => {
    try {
      const response = await axios.put(`${baseUrl}/admin/blog/status/${blogId}`, { status: newStatus });
      const updatedBlog = response.data.data;
      const updatedBlogs = blogs.map((b) => b.id === blogId ? { ...b, status: updatedBlog.status } : b);
      setBlogs(updatedBlogs);
      toast.success("Blog status updated successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update blog status");
    }
  };

  // Color coding for status
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'published':
        return 'success';
      case 'archived':
        return 'secondary';
      default:
        return 'primary';
    }
  };

 
  const [content, setContent] = useState('');
  
  function onChange(e) {
    setContent(e.target.value);
  }

  console.log(content)

  useEffect(() => {
    setContent(blog.content || "");
  }, [blog]);

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteBlog}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Blog" />
          <Row>
            <Col lg="12">
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="mb-3">
                    <h5 className="card-title">
                      Blog List{" "}
                      <span className="text-muted fw-normal ms-2">
                        ({blogs?.length})
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
                          setBlog({});
                          setIsEdit(false);
                          toggle();
                        }}
                      >
                        <i className="bx bx-plus me-1"></i> Add New Blog
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
                  ) : Array.isArray(blogs) && filteredBlogs.length > 0 ? (
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Read Time</th>
                          <th>Status</th>
                          <th>Likes</th>
                          <th>Views</th>
                          <th>Featured Image</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBlogs.map((b, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{b.title}</td>
                            <td>{b.category}</td>
                            <td>{b.readTime+" min read"} </td>
                            <td>
                              <Badge color={getStatusColor(b.status)}>
                                {b.status}
                              </Badge>
                            </td>
                            <td>{b.likes || 0}</td>
                            <td>{b.views || 0}</td>
                            <td><img src={b.featuredImage} alt="Blog" style={{ width: '100px' }} /></td>
                            <td>
                              <div className="d-flex gap-3">
                                <Link
                                  className="text-success"
                                  to="#"
                                  onClick={() => handleBlogClick(b)}
                                >
                                  <i className="mdi mdi-pencil font-size-18"></i>
                                </Link>
                                <Link
                                  className="text-danger"
                                  to="#"
                                  onClick={() => onClickDelete(b)}
                                >
                                  <i className="mdi mdi-delete font-size-18"></i>
                                </Link>
                                <select
                                  value={b.status}
                                  onChange={(e) => updateBlogStatus(b.id, e.target.value)}
                                >
                                  {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
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
                      {isEdit ? "Edit Blog" : "Add New Blog"}
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
                            <Editor value={content} onChange={onChange} />
                            <div className="mb-3">
                              <Label className="form-label">Category</Label>
                              <Input
                                name="category"
                                type="select"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.category || ""}
                                invalid={
                                  validation.touched.category &&
                                  validation.errors.category
                                }
                              >
                                {categories.map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </Input>
                              <FormFeedback type="invalid">
                                {validation.errors.category}
                              </FormFeedback>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">Read Time <small>(in minutes)</small></Label>
                              <Input
                                name="readTime"
                                type="number"
                                placeholder="Read Time"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.readTime || ""}
                                invalid={
                                  validation.touched.readTime &&
                                  validation.errors.readTime
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.readTime}
                              </FormFeedback>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">Featured Image</Label>
                              <Input
                                name="featuredImage"
                                type="file"
                                onChange={(event) => {
                                  validation.setFieldValue("featuredImage", event.currentTarget.files[0]);
                                }}
                                onBlur={validation.handleBlur}
                                invalid={
                                  validation.touched.featuredImage &&
                                  validation.errors.featuredImage
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.featuredImage}
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
                                  {clicked ? 'Processing...' : 'Create Blog'}
                                </button>
                              ) : (
                                <button
                                  type="submit"
                                  className="btn btn-primary save-user"
                                >
                                  {clicked ? 'Processing...' : 'Update Blog'}
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

export default withAuth(ManageBlog);