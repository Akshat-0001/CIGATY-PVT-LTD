import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is CIGATY?',
      answer: "CIGATY is India's first professional B2B marketplace built exclusively for the liquor industry. Our secure platform enables verified buyers and sellers to trade efficiently and transparently.",
    },
    {
      question: 'How do I register on CIGATY?',
      answer: 'Click "Sign Up" and complete our three-step registration: Account Details, Company Details, and Document Upload. We review applications within 24-48 hours.',
    },
    {
      question: 'What documents do I need to register?',
      answer: "You'll need business registration documents, tax identification, and relevant licenses for trading alcoholic beverages in your region.",
    },
    {
      question: 'Is there a fee to use CIGATY?',
      answer: 'No, there is no fee to use CIGATY.',
    },
    {
      question: 'How does CIGATY handle compliance?',
      answer: 'Our platform includes automated compliance checking, licensing verification, and regulatory alerts to ensure all transactions meet legal requirements.',
    },
    {
      question: 'How do I get support?',
      answer: 'Visit our Contact page or email support@cigaty.com for assistance.',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about CIGATY
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                style={{ transition: 'none', transform: 'none' }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQs;
