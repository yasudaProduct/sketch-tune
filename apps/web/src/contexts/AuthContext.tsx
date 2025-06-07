"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  daw?: string;
  skillLevel?: "beginner" | "intermediate" | "advanced";
  experienceYears?: number;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const mockUsers: User[] = [
  {
    id: "user1",
    name: "Demo User",
    email: "demo@sketchtunes.com",
    avatar:
      "https://images.pexels.com/photos/1056553/pexels-photo-1056553.jpeg?auto=compress&cs=tinysrgb&w=150",
    bio: "Electronic music producer exploring new sounds.",
    daw: "Ableton Live",
    skillLevel: "intermediate",
    experienceYears: 3,
    createdAt: "2023-01-15T12:00:00Z",
  },
  {
    id: "user2",
    name: "LoFi Producer",
    email: "lofi@sketchtunes.com",
    avatar:
      "https://images.pexels.com/photos/4048277/pexels-photo-4048277.jpeg?auto=compress&cs=tinysrgb&w=150",
    bio: "Crafting chill beats from my bedroom studio.",
    daw: "FL Studio",
    skillLevel: "beginner",
    experienceYears: 1,
    createdAt: "2023-09-20T15:30:00Z",
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for saved user in localStorage (simulating persistence)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string
    // password: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Find user with matching email (in a real app, this would be a server request)
      const user = mockUsers.find((u) => u.email === email);

      if (user) {
        setCurrentUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        throw new Error("Invalid credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string
    // password: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Check if user exists (in a real app, this would be a server request)
      if (mockUsers.some((u) => u.email === email)) {
        throw new Error("User already exists");
      }

      // Create new user
      const newUser: User = {
        id: `user${Date.now()}`, // Generate a unique ID
        name,
        email,
        createdAt: new Date().toISOString(),
      };

      // In a real app, we would save this to a database
      setCurrentUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        setCurrentUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
