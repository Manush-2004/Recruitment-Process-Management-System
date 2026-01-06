import axiosInstance from './axiosConfig';

export const getMe = async () => {
  const res = await axiosInstance.get('/api/candidates/me');
  return res.data;
};

export const getMyInterviews = async () => {
  const res = await axiosInstance.get('/api/candidates/me/interviews');
  return res.data;
};

export const getMyOffers = async () => {
  const res = await axiosInstance.get('/api/candidates/me/offers');
  return res.data;
};

export const getMyStatusHistory = async () => {
  const res = await axiosInstance.get('/api/candidates/me/status-history');
  return res.data;
};

export const uploadDocument = async (file) => {
  const form = new FormData();
  form.append('file', file);
  const res = await axiosInstance.post('/api/candidates/me/documents', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const downloadOffer = async (offer) => {
  // Offer contains OfferPdfPath (e.g. /uploads/offers/xxx.pdf)
  // return the public url that frontend can use
  return offer.OfferPdfPath;
};
