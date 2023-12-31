import { prismaClient } from "../db/prismaClient";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserData } from "../interfaces";
import { setReservStatus } from "./getControllers";

export class Edit {
  async changeStatus(req: Request, res: Response) {
    const { reservId } = await req.params;
    const { status, dateTime } = await req.body;

    const NumberId = Number(reservId);

    prismaClient.reservs
      .update({
        where: { id: NumberId },
        data: {
          status:
            status === "concluido" ? setReservStatus(dateTime) : "concluido",
        },
      })
      .then((resp) => {
        res.status(200).json(resp);
      })
      .catch((err) => console.log(err));
  }

  async editReserv(req: Request, res: Response) {
    const { reservId } = await req.params;
    const { dateTime, service } = await req.body;
    const NumberId = Number(reservId);

    prismaClient.reservs
      .update({
        where: { id: NumberId },
        data: { dateTime, service },
      })
      .then((resp) => {
        res.status(200).json(resp);
      })
      .catch((err) => console.log(err));
  }

  async editUser(req: Request, res: Response) {
    const { userId } = await req.params;
    const { name, phoneNumber, password } = await req.body;

    const user = await prismaClient.users.findFirst({ where: { id: userId } });

    if (phoneNumber === user.phoneNumber) {
      return prismaClient.users
        .update({
          where: { id: userId },
          data: {
            name,
          },
        })
        .then((resp) => {
          return res.status(200).json(resp);
        })
        .catch((err) => console.log(err));
    }

    /* ------------------------------------------------- */
    const phoneNumberVerifier = await prismaClient.users.findFirst({
      where: { phoneNumber },
    });

    const verifyPassword = await bcrypt.compare(password, user.password);

    const conditions = [
      { condition: phoneNumberVerifier === null, errorMsg: "numero em uso" },
      { condition: verifyPassword, errorMsg: "senha incorreta" },
    ];

    if (conditions.some((condition) => !condition.condition))
      return res
        .status(401)
        .send(conditions.find((condition) => !condition.condition).errorMsg);

    /* ------------------------------------------------- */

    prismaClient.users
      .update({
        where: { id: userId },
        data: {
          phoneNumber,
        },
      })
      .then((resp) => {
        res.status(200).json(resp);
      })
      .catch((err) => console.log(err));
  }

  async editPassword(req: Request, res: Response) {
    const { userId } = await req.params;
    const { currentPassword, newPassword } = await req.body;
 
    /* ------------------------------------------------- */
    const user = await prismaClient.users.findFirst({ where: { id: userId } });

    const verifyPassword = await bcrypt.compare(currentPassword, user.password);

    const conditions = [
      { condition: verifyPassword, errorMsg: "senha incorreta" },
    ];

    if (conditions.some((condition) => !condition.condition))
      return res
        .status(401)
        .send(conditions.find((condition) => !condition.condition).errorMsg);

    /* ------------------------------------------------- */
    const newPasswordCrypted = await bcrypt.hash(newPassword, 8);
    prismaClient.users
      .update({
        where: { id: userId },
        data: {
          password: newPasswordCrypted,
        },
      })
      .then((resp) => {
        res.status(200).json(resp);
      })
      .catch((err) => console.log(err));
  }
}
