import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import apiService from "../../services/api";

const categoryOptions = ["Development", "Design", "Marketing", "Business", "Other"];

export function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Development");
  const [pricingMode, setPricingMode] = useState<"free" | "paid">("free");
  const [price, setPrice] = useState("0");
  const [coverImage, setCoverImage] = useState("");

  useEffect(() => {
    const loadCourse = async () => {
      if (!id) return;

      try {
        const course = await apiService.getCourseById(id);
        setTitle(course.title || "");
        setDescription(course.description || "");
        setCategory(course.category || "Development");
        const loadedPrice = Number(course.price ?? 0);
        setPrice(String(loadedPrice));
        setPricingMode(loadedPrice > 0 ? "paid" : "free");
        setCoverImage(course.coverImage || "");
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load course for editing");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCourse();
  }, [id]);

  const formErrors = useMemo(() => {
    const issues: string[] = [];

    if (!title.trim()) {
      issues.push("Course title is required");
    }

    if (!description.trim() || description.trim().length < 10) {
      issues.push("Course description must be at least 10 characters");
    }

    const priceNum = Number(price);
    if (pricingMode === "paid") {
      if (Number.isNaN(priceNum) || priceNum <= 0) {
        issues.push("Paid course price must be greater than 0");
      }
    } else if (Number.isNaN(priceNum) || priceNum < 0) {
      issues.push("Price must be a valid non-negative number");
    }

    if (!categoryOptions.includes(category)) {
      issues.push("Please choose a valid category");
    }

    return issues;
  }, [title, description, price, category, pricingMode]);

  const handleSave = async () => {
    if (formErrors.length > 0) {
      setError(formErrors[0]);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        price: pricingMode === "free" ? 0 : Number(price),
        currency: "ETB",
        coverImage: coverImage.trim() || undefined,
      };

      const savedCourse = isEditing && id
        ? await apiService.updateCourse(id, payload)
        : await apiService.createCourse(payload);

      navigate(`/app/courses/${savedCourse._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save course");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{isEditing ? "Edit Course" : "Create New Course"}</h1>
          <p className="text-slate-500 dark:text-slate-400">Save course metadata, then continue inside the course page to add lessons, resources, quizzes, and projects.</p>
        </div>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Required fields are validated before submission.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Course Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Complete Web Development Bootcamp" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="Describe what students will learn, who the course is for, and expected outcomes..."
            />
            <p className="text-xs text-slate-500">
              Minimum 10 characters ({description.trim().length}/10)
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <select
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pricing Model *</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={pricingMode === "free" ? "default" : "outline"}
                  onClick={() => {
                    setPricingMode("free");
                    setPrice("0");
                  }}
                >
                  Free
                </Button>
                <Button
                  type="button"
                  variant={pricingMode === "paid" ? "default" : "outline"}
                  onClick={() => setPricingMode("paid")}
                >
                  Paid
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Price (ETB) *</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={pricingMode === "free" ? "0" : price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={pricingMode === "free"}
              placeholder="0"
            />
            <p className="text-xs text-slate-500">
              {pricingMode === "free" ? "Students can enroll instantly for free." : "Students must complete checkout to unlock this course."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cover Image URL</label>
            <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/app/instructor/courses")}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Update and Open Course" : "Create and Open Course"}
            </>
          )}
        </Button>
      </div>

      {formErrors.length > 0 ? <HintBanner message={formErrors[0]} /> : null}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </div>
  );
}

function HintBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
      {message}
    </div>
  );
}
