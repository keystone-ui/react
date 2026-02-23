"use client";

import { Button } from "@keystoneui/react/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@keystoneui/react/modal";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing and using this platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and all applicable laws and regulations.",
  },
  {
    title: "2. Use License",
    body: "Permission is granted to temporarily download one copy of the materials on this platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.",
  },
  {
    title: "3. Account Responsibilities",
    body: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for any activities that occur under your account.",
  },
  {
    title: "4. Privacy Policy",
    body: "Your privacy is important to us. Our Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
  },
  {
    title: "5. Intellectual Property",
    body: "The platform and its original content, features, and functionality are the exclusive property of the company and its licensors. Protected by copyright and trademark law.",
  },
  {
    title: "6. Termination",
    body: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.",
  },
  {
    title: "7. Limitation of Liability",
    body: "In no event shall the company be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the platform.",
  },
  {
    title: "8. Changes to Terms",
    body: "We reserve the right to modify or replace these Terms at any time. By continuing to use our platform after revisions become effective, you agree to be bound by the revised terms.",
  },
];

export default function ModalLongContent() {
  return (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Terms &amp; Conditions
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Terms of Service</ModalTitle>
          <ModalDescription>
            Please read these terms carefully before using our services.
          </ModalDescription>
        </ModalHeader>
        <div className="space-y-6 text-sm leading-relaxed">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="mb-2 font-semibold">{section.title}</h3>
              <p className="text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
        <ModalFooter>
          <ModalClose render={<Button />}>I Accept</ModalClose>
          <ModalClose render={<Button variant="outline" />}>Decline</ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
