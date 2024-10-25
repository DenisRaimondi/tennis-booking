// services/userService.js

// Mock del database utenti
let users = [
    { username: 'mario.rossi', password: 'tennis2024', name: 'Mario Rossi', email: 'mario.rossi@email.com' },
    { username: 'anna.verdi', password: 'tennis2024', name: 'Anna Verdi', email: 'anna.verdi@email.com' },
    { username: 'demo', password: 'demo', name: 'Utente Demo', email: 'demo@email.com' }
  ];
  
  export const UserService = {
    login: async (username, password) => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula latenza
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      throw new Error('Credenziali non valide');
    },
  
    register: async (userData) => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula latenza
      
      // Verifica se username o email sono già in uso
      if (users.some(u => u.username === userData.username)) {
        throw new Error('Username già in uso');
      }
      if (users.some(u => u.email === userData.email)) {
        throw new Error('Email già in uso');
      }
  
      // Aggiungi nuovo utente
      const newUser = {
        ...userData,
        id: Date.now()
      };
      users.push(newUser);
  
      // Ritorna utente senza password
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    },
  
    getAllUsers: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return users.map(({ password, ...user }) => user);
    }
  };