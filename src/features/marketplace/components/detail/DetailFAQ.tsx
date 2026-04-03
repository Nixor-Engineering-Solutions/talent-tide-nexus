import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface FAQItem { question: string; answer: string }
interface Props { faq: FAQItem[] }

export default function DetailFAQ({ faq }: Props) {
  if (faq.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">FAQ</h3>
      <Accordion type="multiple" className="space-y-1">
        {faq.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 text-sm font-heading font-semibold text-foreground hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
