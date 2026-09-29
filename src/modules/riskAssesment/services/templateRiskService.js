// templateRiskService.js
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_CFTB}/risk-template-service/api/risks`; // your real backend endpoint

export const getAllTemplateRisks = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getTemplateRiskById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export default {
  getAllTemplateRisks,
  getTemplateRiskById,
};
