import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAiStore } from "../store/useAiStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Lightbulb, Wand2, MessageSquareReply, Loader } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const fileInputRef = useRef(null);
    const { sendMessage, selectedUser, messages } = useChatStore();
    const { authUser } = useAuthStore();

    const {
        generateFollowUp, isGeneratingFollowUp, followUpSuggestions, clearFollowUpSuggestions,
        generateReply, isGeneratingReply, replySuggestions, clearReplySuggestions,
        refineMessage, isRefining, refinedMessages, clearRefinedMessages,
    } = useAiStore();

    const [activeSuggestionType, setActiveSuggestionType] = useState(null);

    const isLoading = isGeneratingFollowUp || isGeneratingReply || isRefining;

    // --- NEW: Reset state when the selected user changes ---
    useEffect(() => {
        setText("");
        setImagePreview("");
        setActiveSuggestionType(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [selectedUser]); // This effect runs every time selectedUser changes

    // --- CONTEXT FOR AI BUTTONS ---
    const lastMessage = messages[messages.length - 1];
    const isMyLastMessage = lastMessage?.senderId === authUser._id;

    // --- ICON DISPLAY LOGIC ---
    const showRefineButton = text.length > 0;
    const showFollowUpButton = !text; 
    const showReplyButton = !text && lastMessage && !isMyLastMessage;

    // --- ACTION HANDLERS ---
    const handleGetFollowUp = () => {
        clearReplySuggestions(); 
        setActiveSuggestionType('follow-up');
        generateFollowUp(selectedUser._id);
    };

    const handleGetReplies = () => {
        clearFollowUpSuggestions(); 
        setActiveSuggestionType('reply');
        if (selectedUser?._id) {
            generateReply(selectedUser._id);
        }
    };

    const handleRefine = () => {
        setActiveSuggestionType('refine');
        refineMessage(text, 'friendly');
    };

    const handleSelectSuggestion = (suggestion) => {
        setText(suggestion);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;
        await sendMessage({ text: text.trim(), image: imagePreview });
        
        // Clear everything on send
        setText("");
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        clearFollowUpSuggestions();
        clearReplySuggestions();
        clearRefinedMessages();
        setActiveSuggestionType(null);
    };
    
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (!file?.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}
		const reader = new FileReader();
		reader.onloadend = () => setImagePreview(reader.result);
		reader.readAsDataURL(file);
	};

	const removeImage = () => {
		setImagePreview(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

    useEffect(() => {
        if (!text) {
             // Don't clear suggestions here, only hide the popover
            if(activeSuggestionType === 'refine') setActiveSuggestionType(null);
        }
    }, [text, activeSuggestionType]);

    const getSuggestions = () => {
        switch (activeSuggestionType) {
            case 'reply': return replySuggestions;
            case 'follow-up': return followUpSuggestions;
            case 'refine': return refinedMessages;
            default: return [];
        }
    };

    const getTitle = () => {
        switch (activeSuggestionType) {
            case 'reply': return "Reply Suggestions";
            case 'follow-up': return "Follow-Up Suggestions";
            case 'refine': return "Refined Messages";
            default: return "";
        }
    };

    return (
        <div className='p-4 pt-2 border-t border-base-300 relative'>
            {activeSuggestionType && (
                <div className='absolute bottom-full left-0 right-0 p-2 z-20'>
                    <div className='bg-base-300 p-3 rounded-lg shadow-xl max-w-lg mx-auto'>
                        <div className='flex justify-between items-center mb-2'>
                            <h4 className='text-sm font-bold text-center flex-1 text-primary'>
                                {getTitle()}
                            </h4>
                            <button className='btn btn-xs btn-ghost' onClick={() => setActiveSuggestionType(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        {isLoading && <span className="loading loading-dots loading-sm text-secondary mx-auto block my-4" />}
                        
                        <div className='space-y-2 max-h-48 overflow-y-auto'>
                            {getSuggestions().map((s, i) => (
                                <button
                                    key={i}
                                    className='w-full text-left p-2 rounded-md bg-base-100 hover:bg-primary hover:text-primary-content transition-colors text-sm'
                                    onClick={() => handleSelectSuggestion(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
			{imagePreview && (
				<div className='mb-3'>
					<div className='relative w-20 h-20'>
						<img src={imagePreview} alt='Preview' className='w-full h-full object-cover rounded-lg border border-base-300' />
						<button onClick={removeImage} className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center' type='button'>
							<X className='size-3' />
						</button>
					</div>
				</div>
			)}

            <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
                <div className='flex-1 relative flex items-center'>
                    <input
                        type='text'
                        className='w-full input input-bordered rounded-lg pl-3 pr-28'
                        placeholder='Type a message...'
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className='absolute right-2 flex items-center gap-1'>
                        {showReplyButton && (
                            <button type='button' className='btn btn-xs btn-circle btn-ghost' onClick={handleGetReplies} title='Suggest Reply'>
                                <MessageSquareReply className={`w-4 h-4 text-purple-500 ${isGeneratingReply ? "animate-pulse" : ""}`} />
                            </button>
                        )}
                        {showFollowUpButton && (
                            <button type='button' className='btn btn-xs btn-circle btn-ghost' onClick={handleGetFollowUp} title='Suggest Follow-up'>
                                <Lightbulb className='w-4 h-4 text-yellow-500' />
                            </button>
                        )}
                        {showRefineButton && (
                            <button type='button' className='btn btn-xs btn-circle btn-ghost' onClick={handleRefine} title='Refine Message'>
                                <Wand2 className='w-4 h-4 text-blue-500' />
                            </button>
                        )}
                    </div>
                </div>
                
                <input type='file' accept='image/*' className='hidden' ref={fileInputRef} onChange={handleImageChange} />
                <button type='button' className={`btn btn-circle ${imagePreview ? "btn-success" : "btn-ghost"}`} onClick={() => fileInputRef.current?.click()}>
                    <Image size={20} />
                </button>
                <button type='submit' className='btn btn-primary btn-circle' disabled={!text.trim() && !imagePreview}>
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;