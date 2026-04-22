import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuthConfig, isAuthenticated, isPatient } from "../utils/auth";
import { showErrorToast, showSuccessToast } from "../utils/toast";
import { MessageCircle, Send, FileText, ArrowLeft, User, Clock, Check, Stethoscope, Upload } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL;
const API = `${BASE}/chat`;

const PatientChat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState("");

  useEffect(() => {
    if (!isAuthenticated() || !isPatient()) {
      navigate("/login");
      return;
    }
    fetchConversations();
    fetchAvailableDoctors();
  }, [navigate]);

  useEffect(() => {
    if (selectedConv) fetchMessages(selectedConv._id);
  }, [selectedConv?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/conversations`, getAuthConfig());
      setConversations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDoctors = async () => {
    try {
      const res = await axios.get(`${API}/available-doctors`, getAuthConfig());
      setAvailableDoctors(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await axios.get(`${API}/conversations/${convId}/messages`, getAuthConfig());
      setMessages(res.data || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error(err);
    }
  };

  const startConversation = async (doctorId) => {
    try {
      const res = await axios.post(`${API}/conversations`, { doctorId }, getAuthConfig());
      setSelectedConv(res.data);
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === res.data._id);
        if (exists) return prev.map((c) => (c._id === res.data._id ? res.data : c));
        return [res.data, ...prev];
      });
      setShowNewChat(false);
      fetchMessages(res.data._id);
      showSuccessToast(`Chat started with Dr. ${res.data.doctorId?.username || 'Doctor'}`);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to start chat");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    setSending(true);
    try {
      const res = await axios.post(
        `${API}/conversations/${selectedConv._id}/messages`,
        { content: newMessage.trim() },
        getAuthConfig()
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    console.log('Selected conversation:', selectedConv);
    
    if (!file || !selectedConv) {
      console.log('Missing file or conversation');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    console.log('File type:', file.type);
    console.log('Allowed types:', allowedTypes);
    
    if (!allowedTypes.includes(file.type)) {
      showErrorToast('Only PDF, PNG, and JPG files are allowed');
      return;
    }
    
    // Validate file size (5MB max)
    console.log('File size:', file.size);
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("prescription", file);
      console.log('FormData created, uploading...');
      
      const config = {
        ...getAuthConfig(),
        headers: { ...getAuthConfig().headers, "Content-Type": "multipart/form-data" },
      };
      
      console.log('Upload URL:', `${API}/conversations/${selectedConv._id}/prescription`);
      const res = await axios.post(
        `${API}/conversations/${selectedConv._id}/prescription`,
        formData,
        config
      );
      
      console.log('Upload response:', res.data);
      setMessages((prev) => [...prev, res.data]);
      showSuccessToast('Medical document uploaded successfully');
      scrollToBottom();
    } catch (err) {
      console.error('Upload error:', err);
      showErrorToast(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const filteredDoctors = availableDoctors.filter(doc => 
    doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    doc.email.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    (doc.specialization && doc.specialization.toLowerCase().includes(searchDoctor.toLowerCase()))
  );

  const otherName = selectedConv
    ? selectedConv.doctorId?.username || selectedConv.patientId?.username
    : "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 flex items-center gap-4 px-6 py-4">
        <button 
          onClick={() => navigate("/patient/dashboard")} 
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Doctor Consultation</h1>
            <p className="text-sm text-gray-500">Connect with your healthcare providers</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl px-4 py-3 font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-5 h-5" />
              {showNewChat ? "Hide Doctors" : "Consult Doctor"}
            </button>
          </div>

          {/* New Chat Panel */}
          {showNewChat && (
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Search doctors by name, specialty..."
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div className="max-h-64 overflow-y-auto px-4 pb-4">
                {filteredDoctors.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {searchDoctor ? "No doctors found" : "No doctors from your appointments yet"}
                    </p>
                  </div>
                ) : (
                  filteredDoctors.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => startConversation(doc.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-green-50 transition-colors mb-2 border border-gray-200 hover:border-green-300 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">Dr. {doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.specialization || "General Practice"}</p>
                          {doc.email && <p className="text-xs text-gray-400">{doc.email}</p>}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Consultations</h3>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-12 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No consultations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start a new chat with your doctor</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => setSelectedConv(c)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                        selectedConv?._id === c._id 
                          ? "bg-gradient-to-r from-green-50 to-green-100 border-green-300 shadow-md" 
                          : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      } border`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          selectedConv?._id === c._id ? "bg-green-600" : "bg-gray-100"
                        }`}>
                          <User className={`w-4 h-4 ${
                            selectedConv?._id === c._id ? "text-white" : "text-gray-600"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${
                            selectedConv?._id === c._id ? "text-green-900" : "text-gray-800"
                          }`}>
                            Dr. {c.doctorId?.username || "Doctor"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {c.lastMessageAt ? formatDate(c.lastMessageAt) : "No messages"}
                          </p>
                        </div>
                        {c.lastMessageAt && (
                          <div className="text-xs text-gray-400">
                            {formatTime(c.lastMessageAt)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                  <Stethoscope className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Start a Consultation</h3>
                <p className="text-gray-500">Choose a doctor from the list to begin your consultation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">Dr. {otherName}</h2>
                      <p className="text-green-100 text-sm">Healthcare Provider</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-100 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Available</span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((m, index) => {
                    const isPatient = m.senderRole === "patient";
                    const showDate = index === 0 || 
                      new Date(m.createdAt).toDateString() !== new Date(messages[index - 1]?.createdAt).toDateString();
                    
                    return (
                      <div key={m._id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {formatDate(m.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isPatient ? "order-2" : "order-1"}`}>
                            <div className={`px-5 py-3 shadow-sm ${
                              isPatient 
                                ? "bg-green-600 text-white rounded-2xl rounded-tr-none" 
                                : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none"
                            }`}>
                              {m.type === "prescription" ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                                    <FileText className="w-5 h-5" />
                                    <span className="font-bold text-sm uppercase tracking-wider">
                                      {isPatient ? "Medical Document" : "Prescription"}
                                    </span>
                                  </div>
                                  <div className={`${isPatient ? "bg-white/10" : "bg-slate-50"} rounded-xl p-4 border ${isPatient ? "border-white/10" : "border-slate-100"}`}>
                                    <p className={`text-xs font-semibold mb-3 ${isPatient ? "text-green-100" : "text-slate-500"}`}>
                                      {m.prescriptionFileName || "medical_report.pdf"}
                                    </p>
                                    <a
                                      href={`${BASE}${m.prescriptionUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                        isPatient 
                                          ? "bg-white text-green-600 hover:bg-green-50" 
                                          : "bg-green-600 text-white hover:bg-green-700"
                                      }`}
                                    >
                                      <FileText className="w-4 h-4" />
                                      View Document
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[15px] leading-relaxed font-medium">{m.content}</p>
                              )}
                              <div className={`flex items-center justify-between mt-2.5 ${
                                isPatient ? "text-green-100" : "text-slate-400"
                              }`}>
                                <span className="text-[10px] font-bold uppercase tracking-tight">{formatTime(m.createdAt)}</span>
                                {isPatient && (
                                  <div className="flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>Sent</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-end gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Upload button clicked');
                        console.log('fileInputRef.current:', fileInputRef.current);
                        fileInputRef.current?.click();
                      }}
                      disabled={uploading}
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
                      title="Upload medical document"
                    >
                      {uploading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your health question or concern..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        disabled={sending}
                        rows={1}
                      />
                      <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                        {newMessage.length}/500
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="p-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {sending ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Press Enter to send • Upload medical documents (PDF, PNG, JPG up to 5MB)
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientChat;
