import axios from 'axios';

const requests = axios.create({ baseURL: 'http://localhost:9999' });

const agent = {
  Users: {
    list: () => requests.get('/users'),
    create: (body) => requests.post('/users', body),
    update: (id, body) => requests.put(`/users/${id}`, body),
    delete: (id) => requests.delete(`/users/${id}`),
  },
  Fields: {
    list: () => requests.get('/fields'),
    create: (body) => requests.post('/fields', body),
    update: (id, body) => requests.put(`/fields/${id}`, body),
    delete: (id) => requests.delete(`/fields/${id}`),
  },
  Bookings: {
    list: () => requests.get('/bookings'),
    create: (body) => requests.post('/bookings', body),
    delete: (id) => requests.delete(`/bookings/${id}`),
  }
};

export default agent;