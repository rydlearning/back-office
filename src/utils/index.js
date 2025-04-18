import moment from 'moment-timezone';
import { Cloudinary } from "cloudinary-core";
new Cloudinary({ cloud_name: "dq5nc6lbr" });

export const UploadImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Emmanuel");
        formData.append("folder", "DevSync");

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/dq5nc6lbr/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();
console.log(data)
        return data.secure_url; // This is the URL of the uploaded image
    } catch (error) {
        console.error("Error uploading image:", error);
    }
};

export function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
  str = str.toLowerCase(); // convert string to lowercase
  str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
           .replace(/\s+/g, '-') // replace spaces with hyphens
           .replace(/-+/g, '-'); // remove consecutive hyphens
  return str;
}

export const totalCohortChild = (programs, id) => {
  const filteredPrograms = programs.filter((program) => program.partnerId === id);
  const programCount = filteredPrograms.reduce((count, program) => {
    const childId = program.childId;
    if (!count.has(childId)) {
      count.set(childId, 1);
    }
    return count;
  }, new Map());

  return programCount.size
};


export const totalCohortParent = (programs, id) => {
  const filteredPrograms = programs.filter((program) => program.partnerId === id);
  const programCount = filteredPrograms.reduce((count, program) => {
    const parentId = program.child.parentId;
    if (!count.has(parentId)) {
      count.set(parentId, 1);
    }
    return count;
  }, new Map());

  return programCount.size
};


export function newFormatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0'); // Get day and pad with zero if needed
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Get month (0-indexed) and pad
  const year = date.getUTCFullYear(); // Get full year

  return `${day}/${month}/${year}`; // Format as DD/MM/YYYY
}

export function calculateDebt(programs) {
  const debt = programs.filter((program) => program.partner_package && !program.isPaid)
    .reduce((total, program) => total + program.partner_package.amount, 0);
  return debt
}

export function formatData(data) {
  const parsed = Array.isArray(data)
    ? data
    : JSON.parse(data)
  return parsed
}



export function convertLessonTimes(times, parentTimezone) {
  const defaultTimezone = "Africa/Lagos";

  const convertedTimes = times.map(slot => {
    const time = moment.tz(
      `${slot.timeText} ${slot.dayText}`,
      "hA dddd",
      defaultTimezone
    );

    const convertedTime = defaultTimezone === parentTimezone
      ? time
      : time.clone().tz(parentTimezone);

    return `${convertedTime.format('dddd')} ${convertedTime.format('h:mmA')}`;
  });

  return convertedTimes.join(', ');
}

export function convertSingleLessonTimes(timeText, parentTimezone, customDay) {
  const defaultTimezone = "Africa/Lagos";

  const day = customDay || 'Monday';  // Default to 'Monday' if customDay is not passed

  // Parsing the time and day with the default timezone 'Africa/Lagos'
  const time = moment.tz(
    `${timeText} ${day}`,
    "hA dddd",
    defaultTimezone
  );

  // Convert to parentTimezone if needed, or keep it in default timezone
  const convertedTime = defaultTimezone === parentTimezone
    ? time
    : time.clone().tz(parentTimezone);

  // Return the time formatted as 'h:mmA'
  return convertedTime.format('h:mmA');
}

export function convertSingleLessonTimesProgram(timeText, parentTimezone, customDay) {
  const defaultTimezone = "Africa/Lagos";

  const day = customDay || 'Monday';  // Default to 'Monday' if customDay is not passed

  // Parsing the time and day with the default timezone 'Africa/Lagos'
  const time = moment.tz(
      `${timeText} ${day}`,
      "hA dddd",
      parentTimezone
  );

  // Convert to parentTimezone if needed, or keep it in default timezone
  const convertedTime = time.clone().tz(defaultTimezone);

  // Return the time formatted as 'h:mmA'
  return convertedTime.format('h:mmA');
}

export function convertTimeGroup(times) {
  try {
    let formatted = [];

    if (Array.isArray(times[0]) && Array.isArray(times)) {
      formatted = times.map((slotPair, index) => {
        const [start, end] = slotPair;
        return {
          value: index,
          name: `${start.dayText} ${start.timeText}, ${end.dayText} ${end.timeText}`,
        };
      });
    }

    else if (Array.isArray(times)) {
      formatted = times.map((slot) => ({
        value: slot.id,
        name: `${slot.dayText} ${slot.timeText}`,
      }));
    }

    return formatted;
  } catch (error) {
    console.error('Error parsing time slots:', error);
    return [];
  }
}

export function convertTimegroupToParentTimezone(timegroup, parentTimezone) {

  const defaultTimezone = "Africa/Lagos";

  const timeStrings = timegroup.split('&').map(str => str.trim());

  const convertedTimes = timeStrings.map(timeString => {
    try {
      const match = timeString.match(/([A-Za-z]+ \d+), ([A-Za-z]+) (\d+)(?::(\d+))?([AP]M)/i);
      if (!match) throw new Error('Invalid format');

      const [, datePart, dayPart, hours, minutes = '00', ampm] = match;
      const currentYear = new Date().getFullYear();
      const dateStr = `${datePart} ${currentYear} ${hours}:${minutes} ${ampm}`;

      const time = moment.tz(dateStr, 'MMMM D YYYY h:mm A', defaultTimezone);

      if (!time.isValid()) {
        throw new Error(`Invalid date: ${dateStr}`);
      }

      if (parentTimezone === defaultTimezone) {
        return `${time.format('MMMM D')}, ${dayPart} ${time.format('h:mmA')}`;
      }

      const convertedTime = time.clone().tz(parentTimezone);

      return `${convertedTime.format('MMMM D')}, ${dayPart} ${convertedTime.format('h:mmA')} `;

    } catch (error) {
      return 'Invalid date';
    }
  });

  return convertedTimes.join(' & ');
}


