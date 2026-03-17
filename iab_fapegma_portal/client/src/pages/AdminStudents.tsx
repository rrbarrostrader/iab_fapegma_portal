import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    course: "",
  });

  const handleAddStudent = () => {
    if (!formData.name || !formData.email || !formData.registrationNumber || !formData.course) {
      toast.error("Preencha todos os campos");
      return;
    }
    toast.success("Aluno adicionado com sucesso!");
    setFormData({ name: "", email: "", registrationNumber: "", course: "" });
    setIsOpen(false);
  };

  const students = [
    {
      id: 1,
      name: "João Silva",
      email: "joao@example.com",
      registrationNumber: "2024001",
      course: "Administração",
      status: "Ativo",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@example.com",
      registrationNumber: "2024002",
      course: "Administração",
      status: "Ativo",
    },
    {
      id: 3,
      name: "Pedro Oliveira",
      email: "pedro@example.com",
      registrationNumber: "2024003",
      course: "Gestão",
      status: "Ativo",
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-yellow-500" />
            Gerenciar Alunos
          </h2>
          <p className="text-slate-600 mt-1">CRUD completo de alunos do sistema</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold gap-2">
              <Plus className="w-4 h-4" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Aluno</DialogTitle>
              <DialogDescription>Preencha os dados do aluno para adicioná-lo ao sistema</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Nome Completo</label>
                <Input
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">E-mail</label>
                <Input
                  type="email"
                  placeholder="joao@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Matrícula</label>
                <Input
                  placeholder="2024001"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Curso</label>
                <Input
                  placeholder="Administração"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>
              <Button onClick={handleAddStudent} className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900">
                Adicionar Aluno
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, e-mail ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>Total de {filteredStudents.length} alunos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Nome</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">E-mail</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Matrícula</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Curso</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{student.name}</td>
                    <td className="px-4 py-3 text-slate-600">{student.email}</td>
                    <td className="px-4 py-3 text-slate-600">{student.registrationNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{student.course}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                          className="gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                          className="gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Deletar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
