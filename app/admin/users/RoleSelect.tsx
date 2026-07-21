"use client";
import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { changeUserLevel } from "./admin-actions";
import { authLevelLabel } from "/types/auth";
