"use client";

import { Send } from "lucide-react";
import { useRef, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserMessage from "@/components/dashboard/user-message";
import AiResponse from "@/components/dashboard/ai-response";
import {
  Form,
  FormControl,
  FormField,
  FormItem
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import Loading from "@/components/loading";
import { useToast } from "@/components/ui/use-toast";
import ToolsNavigation from "@/components/dashboard/tools-navigation";
import { useProStore } from "@/stores/pro-store";
import DecryptedText from "@/components/DecryptedText/DecryptedText";

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Photo prompt is required"
  }),
});

interface MessageType {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

const VideoPage = () => {
  return (
<DecryptedText
text="Ahoy, matey!
Set yer eyes on thisSet yer eyes on this
And try tinkerin’ round’And try tinkerin’ round’
with these here props, arr!with these here props, arr!"
speed={100}
maxIterations={20}
characters="ABCD1234!?"
className="revealed"
parentClassName="all-letters"
encryptedClassName="encrypted"
/>
  )
}

export default VideoPage;
