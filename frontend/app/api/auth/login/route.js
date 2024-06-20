import axios from "axios";
import { serialize } from "cookie";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";

const MAX_AGE = 60 * 60 * 24 * 30; // days;

export async function POST(request) {
  const body = await request.json();

  const { email, password } = body;

  //   if (email !== "admin" || password !== "admin") {
  //     return NextResponse.json(
  //       {
  //         message: "Unauthorized",
  //       },
  //       {
  //         status: 401,
  //       }
  //     );
  //   }

  try {
    const response = await axios.post(
      process.env.BASE_URL + "/api/auth/signin",
      {
        email,
        password,
      }
    );
    console.log(response);
    const seralized = serialize(
      "TokenLog",
      response.data.session.access_token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: MAX_AGE,
        path: "/",
      }
    );

    return new Response(
      JSON.stringify({
        message: "Authenticated!",
      }),
      {
        status: 200,
        headers: { "Set-Cookie": seralized },
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: error.response.data.message,
      },
      {
        status: error.response.status,
      }
    );
  }
}
