import TemplateForm from '../TemplateForm';

export default function NewTemplatePage() {
  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Create New Mission Template
      </h1>
      <TemplateForm />
    </div>
  );
}
