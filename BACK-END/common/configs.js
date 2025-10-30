import dotenv from 'dotenv';
dotenv.config();

const config={
    port:process.env.PORT||3000,
    databaseUrl:process.env.DATABASE_URL
}

export{ config }

/*PORT = 5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=swami
DB_NAME=drugdb
DB_PORT=5001*/
