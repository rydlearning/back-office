import PropTypes from "prop-types"
import React, { useEffect, useRef, useCallback } from "react"

//Import Icons
import FeatherIcon from "feather-icons-react";

//Import images
import giftBox from "../../assets/images/giftbox.png"

// //Import Scrollbar
import SimpleBar from "simplebar-react"

// MetisMenu
import MetisMenu from "metismenujs"
import { Link, useLocation } from "react-router-dom"
import withRouter from "../Common/withRouter"

//i18n
import { withTranslation } from "react-i18next"

const SidebarContent = props => {
  const ref = useRef();
  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.lenght && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const path = useLocation();
  const activeMenu = useCallback(() => {
    const pathName = path.pathname;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [path.pathname, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
    activeMenu();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  return (
    <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("Menu")} </li>
            <li>
              <Link to="/dashboard" className="">
                <FeatherIcon
                    icon="home"
                />{" "}
                <span>{props.t("Dashboard")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-parent" className="">
                <FeatherIcon
                    icon="user"
                />{" "}
                <span>{props.t("Manage Parent")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-child" className="">
                <FeatherIcon
                    icon="users"
                />{" "}
                <span>{props.t("Manage Child")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-teacher" className="">
                <FeatherIcon
                    icon="user-check"
                />{" "}
                <span>{props.t("Manage Teacher")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-program" className="">
                <FeatherIcon
                    icon="feather"
                />{" "}
                <span>{props.t("Manage Program")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-cohort" className="">
                <FeatherIcon
                    icon="grid"
                />{" "}
                <span>{props.t("Manage Cohort")}</span>
              </Link>
            </li>

            {/*<li>*/}
            {/*  <Link to="/manage-program-inactive" className="">*/}
            {/*    <FeatherIcon*/}
            {/*        icon="feather"*/}
            {/*    />{" "}*/}
            {/*    <span>{props.t("Manage Program Inactive")}</span>*/}
            {/*  </Link>*/}
            {/*</li>*/}


            <li>
              <Link to="/manage-package" className="">
                <FeatherIcon
                    icon="package"
                />{" "}
                <span>{props.t("Manage Package")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-swap" className="">
                <FeatherIcon
                    icon="refresh-cw"
                />{" "}
                <span>{props.t("Manage Swap")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-survey" className="">
                <FeatherIcon
                    icon="trending-up"
                />{" "}
                <span>{props.t("Manage Survey")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-coupon" className="">
                <FeatherIcon
                    icon="gift"
                />{" "}
                <span>{props.t("Manage Coupon")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-testimonial" className="">
                <FeatherIcon
                    icon="message-circle"
                />{" "}
                <span>{props.t("Manage Testimonial")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-timetable" className="">
                <FeatherIcon
                    icon="clock"
                />{" "}
                <span>{props.t("Manage TimeTable")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-partner" className="">
                <FeatherIcon
                    icon="user-plus"
                />{" "}
                <span>{props.t("Manage Partners")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-partner-program" className="">
                <FeatherIcon
                    icon="activity"
                />{" "}
                <span>{props.t("Partner Programs")}</span>
              </Link>
            </li>

            <li>
              <Link to="/manage-promo" className="">
                <FeatherIcon
                    icon="award"
                />{" "}
                <span>{props.t("Manage Adhoc")}</span>
              </Link>
            </li>
            {/* <li>
              <Link to="/manage-promo-program" className="">
                <FeatherIcon
                    icon="aperture"
                />{" "}
                <span>{props.t("Manage Adhoc Programs")}</span>
              </Link>
            </li> */}
              <li>
              <Link to="/manage-blog" className="">
                <FeatherIcon
                    icon="book"
                />{" "}
                <span>{props.t("Manage Blog")}</span>
              </Link>
            </li>
            <li>
              <Link to="/settings" className="">
                <FeatherIcon
                    icon="settings"
                />{" "}
                <span>{props.t("Settings")}</span>
              </Link>
            </li>

          </ul>
          <div className="card sidebar-alert border-0 text-center mx-4 mb-0 mt-5">
            <div className="card-body">
              <div className="mt-4">
                <h5 className="alertcard-title font-size-16">Administrator</h5>
                <p className="font-size-13">Always see live changes while managing the portable.</p>
                <a target="_blank" href="https://rydlearning.com" className="btn btn-primary mt-2" rel="noreferrer">RYD Website</a>
              </div>
            </div>
          </div>
        </div>
      </SimpleBar>
    </React.Fragment>
  )
}

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
}

export default withRouter(withTranslation()(SidebarContent))
