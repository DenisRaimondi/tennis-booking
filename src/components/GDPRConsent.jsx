import React from "react";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const GDPRConsent = ({ consents, onChange, className }) => {
  const handleConsentChange = (key) => {
    onChange({
      ...consents,
      [key]: !consents[key],
    });
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <ScrollArea className="h-64 rounded-md border p-4">
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="privacy-policy">
                <AccordionTrigger>Informativa sulla Privacy</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600">
                    Ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR), la
                    informiamo che i suoi dati personali verranno trattati per
                    le seguenti finalità: - Gestione delle prenotazioni e dei
                    servizi connessi - Comunicazioni relative al servizio -
                    Adempimenti legali e fiscali I suoi dati verranno trattati
                    in modo sicuro e confidenziale, utilizzando strumenti
                    elettronici e cartacei. I dati non verranno diffusi e
                    saranno accessibili solo al personale autorizzato.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={consents.privacy}
                  onCheckedChange={() => handleConsentChange("privacy")}
                  required
                />
                <label
                  htmlFor="privacy"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ho letto e accetto l'informativa sulla privacy{" "}
                  <span className="text-red-500">*</span>
                </label>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              * Campi obbligatori per procedere con la registrazione
            </p>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default GDPRConsent;
