import { toast } from "react-toastify";

/**
 * Centralized error handler for API responses.
 * Interprets the standardized ProblemDetails backend response and shows appropriate toast notifications.
 *
 * @param {Error} error - The Axios error object.
 */
const handleApiError = (error) => {
  // If there's no response from the server (e.g., network error or timeout)
  if (!error.response) {
    console.error("Network or unexpected error:", error);
    toast.error("Network error or server is unreachable. Please try again.");
    return;
  }

  const { status, data } = error.response;
  const problemDetails = data || {};

  // Extract error message from ProblemDetails fields or fallback
  const fallbackMessage = "An unexpected error occurred.";
  const title = problemDetails.title;
  const detail = problemDetails.detail;
  const message = problemDetails.message; // Legacy support if needed

  // Format validation errors if they exist
  let errorMessage = detail || message || title || fallbackMessage;

  if (problemDetails.errors && typeof problemDetails.errors === "object") {
    const errorMessages = Object.values(problemDetails.errors).flat();
    if (errorMessages.length > 0) {
      // Display multiple validation messages clearly
      errorMessage = errorMessages.join(" ");
    }
  }

  switch (status) {
    case 400: // Bad Request
    case 422: // Unprocessable Entity
      toast.warning(errorMessage);
      break;

    case 401: // Unauthorized
      toast.info(errorMessage || "Session expired. Please log in again.");
      // if (typeof localStorage !== "undefined") {
      //   localStorage.removeItem("token");
      // }
      // if (
      //   typeof window !== "undefined" &&
      //   typeof window.location !== "undefined"
      // ) {
      //   window.location.href = "/login";
      // }
      break;

    case 403: // Forbidden
      toast.warning("You do not have permission to perform this action.");
      break;

    case 404: // Not Found
      toast.warning(errorMessage);
      break;

    case 409: // Conflict
      toast.error(errorMessage);
      break;

    case 500: // Internal Server Error
      toast.error(detail || "An internal server error occurred.");
      break;

    default:
      toast.error(errorMessage);
      break;
  }
};

export default handleApiError;
