"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const superAdmin_1 = __importDefault(require("./routes/superAdmin"));
const retailerAdminAuthRoute_1 = __importDefault(require("./routes/RetailerRoutes/retailerAdminAuthRoute"));
const productionAdminAuthRoute_1 = __importDefault(require("./routes/ProductionRoutes/productionAdminAuthRoute"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const morgan_1 = __importDefault(require("morgan"));
const errohandlerMiddleware_1 = __importDefault(require("./middleware/errohandlerMiddleware"));
const retailerAdmin_1 = __importDefault(require("./routes/RetailerRoutes/retailerAdmin"));
const productionRoute_1 = __importDefault(require("./routes/ProductionRoutes/productionRoute"));
const SalesRoutes_1 = __importDefault(require("./routes/SalesRoutes/SalesRoutes"));
const conversationRoute_1 = __importDefault(require("./routes/conversationRoute"));
const messagesRoute_1 = __importDefault(require("./routes/messagesRoute"));
const reviewRoute_1 = __importDefault(require("./routes/reviewRoute"));
const stripeRoute_1 = __importDefault(require("./routes/stripeRoute/stripeRoute"));
const socket_io_1 = require("./socket/socket.io");
const stripe_1 = __importDefault(require("stripe"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const mongoURL = process.env.MONGO;
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('tiny'));
// app.use(cors({
//     origin: 'http://localhost:5173', 
//     credentials: true
// }))
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'https://scaleb-frontend-4qtpugzb0-ahammed-alis-projects.vercel.app');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     next();
// });
// app.use(cors());
app.use((0, express_session_1.default)({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));
app.use(errohandlerMiddleware_1.default);
(0, socket_io_1.SocketServer)(server);
mongoose_1.default.connect(mongoURL).then(() => {
    console.log("Connected to mongodb");
}).catch((err) => {
    console.log('Error in mongoDB', err);
});
server.listen(3000, () => {
    console.log('http://localhost:3000/');
});
app.use('/admin', superAdmin_1.default);
app.use('/retailer/auth', retailerAdminAuthRoute_1.default);
app.use('/retailer', retailerAdmin_1.default);
app.use('/production/auth', productionAdminAuthRoute_1.default);
app.use('/production', productionRoute_1.default);
app.use('/sales', SalesRoutes_1.default);
app.use('/conversation', conversationRoute_1.default);
app.use('/messages', messagesRoute_1.default);
app.use('/review', reviewRoute_1.default);
app.use('/stripe', stripeRoute_1.default);
