import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CounselorLogin from "./CounselorLogin";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

jest.mock("axios");
jest.mock("../firebase", () => ({ auth: {} }));
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("CounselorLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs in a verified counselor by fetching their profile by uid", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "abc123", email: "counselor@example.com" },
    });
    axios.get.mockResolvedValue({
      data: [
        { uid: "abc123", email: "counselor@example.com", status: "Verified" },
      ],
    });

    render(
      <BrowserRouter>
        <CounselorLogin />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("name@university.edu"), {
      target: { name: "email", value: "counselor@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { name: "password", value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /access portal/i }));

    await waitFor(() => expect(signInWithEmailAndPassword).toHaveBeenCalled());
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/api/counselors/abc123"),
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/CounselorDashboard"),
    );
  });
});
