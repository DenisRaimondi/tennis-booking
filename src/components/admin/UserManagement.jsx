import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { UserStatus } from "../../models/User";
import AuthService from "../../services/authService";
import { LoadingSpinner } from "../ui/loading-spinner";

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const allUsers = await AuthService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setIsLoading(true);
      if (newStatus === UserStatus.ACTIVE) {
        await AuthService.approveUser(userId);
      } else if (newStatus === UserStatus.DISABLED) {
        await AuthService.disableUser(userId);
      }
      await loadUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search);

    if (filter === "ALL") return matchesSearch;
    return matchesSearch && user.status === filter;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Cerca per nome, email o telefono"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="ALL">Tutti gli utenti</option>
          <option value={UserStatus.PENDING}>In attesa</option>
          <option value={UserStatus.ACTIVE}>Attivi</option>
          <option value={UserStatus.DISABLED}>Disabilitati</option>
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefono</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Registrato il</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    user.status === UserStatus.ACTIVE
                      ? "bg-green-100 text-green-800"
                      : user.status === UserStatus.PENDING
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.status}
                </span>
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString("it-IT")}
              </TableCell>
              <TableCell>
                {user.status === UserStatus.PENDING && (
                  <Button
                    onClick={() =>
                      handleStatusChange(user.id, UserStatus.ACTIVE)
                    }
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    Approva
                  </Button>
                )}
                {user.status === UserStatus.ACTIVE && (
                  <Button
                    onClick={() =>
                      handleStatusChange(user.id, UserStatus.DISABLED)
                    }
                    variant="destructive"
                    size="sm"
                  >
                    Disabilita
                  </Button>
                )}
                {user.status === UserStatus.DISABLED && (
                  <Button
                    onClick={() =>
                      handleStatusChange(user.id, UserStatus.ACTIVE)
                    }
                    variant="outline"
                    size="sm"
                  >
                    Riattiva
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
