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

// Mock the Axios HTTP client library to prevent real network calls
jest.mock("axios");
// Mock the local Firebase config module to supply a dummy auth object
jest.mock("../firebase", () => ({ auth: {} }));
// Mock Firebase Authentication methods with Jest mock functions
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
}));

// Mock spy function to track route navigation calls
const mockNavigate = jest.fn();

// Mock react-router-dom while preserving actual router utilities except useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Test suite for the CounselorLogin component
describe("CounselorLogin", () => {
  // Clear invocation history on all mock functions before each test runs
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case: Verified counselor login verification and dashboard redirection
  it("logs in a verified counselor by fetching their profile by uid", async () => {
    // 1. Mock successful Firebase sign-in response returning user UID and email
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "abc123", email: "counselor@example.com" },
    });

    // 2. Mock successful backend API response returning a verified counselor profile
    axios.get.mockResolvedValue({
      data: [
        { uid: "abc123", email: "counselor@example.com", status: "Verified" },
      ],
    });

    // 3. Render the CounselorLogin component inside a BrowserRouter wrapper
    render(
      <BrowserRouter>
        <CounselorLogin />
      </BrowserRouter>,
    );

    // 4. Simulate user typing their work email into the email input field
    fireEvent.change(screen.getByPlaceholderText("name@university.edu"), {
      target: { name: "email", value: "counselor@example.com" },
    });

    // 5. Simulate user typing their password into the password input field
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { name: "password", value: "secret123" },
    });

    // 6. Simulate user clicking the "Access Portal" submit button
    fireEvent.click(screen.getByRole("button", { name: /access portal/i }));

    // 7. Assert that Firebase signInWithEmailAndPassword was called
    await waitFor(() => expect(signInWithEmailAndPassword).toHaveBeenCalled());

    // 8. Assert that Axios queried the counselors API endpoint
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/api/counselors/abc123"),
    );

    // 9. Assert that navigation redirected the user to the Counselor Dashboard route
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/CounselorDashboard"),
    );
  });
});
