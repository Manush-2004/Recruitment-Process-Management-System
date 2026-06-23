import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getJob } from "../../services/recruiterService";
import axiosInstance from "../../api/axiosConfig";

const JobFeedback = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load job details
        const j = await getJob(id);
        setJob(j);

        // Load all interviews and filter by jobId
        const res = await axiosInstance.get("/api/interviews");
        const allInterviews = res.data || [];
        const jobInterviews = allInterviews.filter(
          (iv) => iv.jobId === parseInt(id, 10),
        );

        // For each interview, try to fetch feedback summary
        const interviewsWithFeedback = await Promise.all(
          jobInterviews.map(async (iv) => {
            try {
              const feedbackRes = await axiosInstance.get(
                `/api/feedback/interview/${iv.id}/summary`,
              );
              return {
                ...iv,
                feedbackSummary: feedbackRes.data,
                hasFeedback: true,
              };
            } catch (err) {
              // No feedback available yet
              return { ...iv, feedbackSummary: null, hasFeedback: false };
            }
          }),
        );

        setInterviews(interviewsWithFeedback);
      } catch (e) {
        console.error("Failed to load job feedback", e);
        setError("Failed to load feedback data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <Link
          to="/recruiter/jobs"
          className="text-sm text-blue-600 hover:underline mb-2 inline-block"
        >
          ← Back to Jobs
        </Link>
        <h1 className="text-2xl font-semibold">
          Feedback for: {job?.title ?? "Job"}
        </h1>
        <p className="text-sm text-ds-text-secondary mt-1">
          View all interviews and feedback for this job position
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-ds-text-secondary">
            No interviews scheduled for this job yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => (
            <div key={iv.id} className="bg-white p-5 rounded-lg border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {iv.roundType} Interview -{" "}
                    {iv.candidate?.fullName || "Candidate"}
                  </h3>
                  <p className="text-sm text-ds-text-secondary mt-1">
                    Scheduled: {new Date(iv.scheduledAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-ds-text-secondary">
                    Mode: {iv.mode}{" "}
                    {iv.meetingLink && `• Link: ${iv.meetingLink}`}
                  </p>
                  <p className="text-sm text-ds-text-secondary">
                    Panel:{" "}
                    {iv.interviewers?.map((i) => i.name).join(", ") ||
                      "Not assigned"}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/recruiter/candidate/${iv.candidateId}`}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    View Candidate
                  </Link>
                </div>
              </div>

              {iv.hasFeedback ? (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Feedback Summary</h4>
                    <div className="text-sm">
                      <span className="font-semibold text-green-600">
                        Average Rating: {iv.feedbackSummary.averageRating}/5
                      </span>
                      <span className="text-ds-text-secondary ml-2">
                        ({iv.feedbackSummary.totalFeedbacks} feedback
                        {iv.feedbackSummary.totalFeedbacks !== 1 ? "s" : ""})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {iv.feedbackSummary.feedbacks.map((fb, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {fb.interviewerName}
                          </span>
                          <span className="text-sm font-semibold">
                            Rating: {fb.overallRating}/5
                          </span>
                        </div>
                        <p className="text-sm text-ds-text-secondary mb-2">
                          {fb.comments}
                        </p>
                        {fb.skills && fb.skills.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-ds-text-secondary mb-1">
                              Skill Ratings:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {fb.skills.map((skill, sidx) => (
                                <span
                                  key={sidx}
                                  className="text-xs bg-white px-2 py-1 rounded border"
                                >
                                  {skill.skillName}: {skill.rating}/5
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-ds-text-secondary italic">
                    No feedback submitted yet. Waiting for interviewers to
                    provide feedback.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobFeedback;
